package main

import (
	"crypto/tls"
	"fmt"
	"html"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const defaultPort = "4000"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	r := gin.Default()
	r.Use(corsMiddleware())
	r.GET("/api/health", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })
	r.POST("/api/contact", handleContact)
	r.POST("/api/auth/login", handleLogin)
	r.GET("/api/auth/me", jwtAuthMiddleware(), handleAuthMe)

	if err := r.Run(":" + port); err != nil {
		fmt.Fprintf(os.Stderr, "server: %v\n", err)
		os.Exit(1)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

func handleContact(c *gin.Context) {
	var body contactRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"ok": false, "error": "Name, email, and message are required"})
		return
	}
	name := strings.TrimSpace(body.Name)
	email := strings.TrimSpace(body.Email)
	msg := strings.TrimSpace(body.Message)
	if name == "" || email == "" || msg == "" {
		c.JSON(400, gin.H{"ok": false, "error": "Name, email, and message are required"})
		return
	}

	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	if smtpUser == "" || smtpPass == "" {
		c.JSON(503, gin.H{"ok": false, "error": "Email not configured"})
		return
	}

	contactTo := os.Getenv("CONTACT_TO")
	if contactTo == "" {
		contactTo = smtpUser
	}
	host := getEnv("SMTP_HOST", "smtp.hostinger.com")
	port := getEnv("SMTP_PORT", "465")

	if err := sendMail(host, port, smtpUser, smtpPass, contactTo, email, name, msg); err != nil {
		fmt.Fprintf(os.Stderr, "contact send error: %v\n", err)
		c.JSON(500, gin.H{"ok": false, "error": "Failed to send message"})
		return
	}
	c.JSON(200, gin.H{"ok": true})
}

func sendMail(host, port, from, pass, to, replyTo, subjectName, body string) error {
	addr := host + ":" + port
	auth := smtp.PlainAuth("", from, pass, host)

	esc := func(s string) string {
		return html.EscapeString(s)
	}
	subject := "Contact form: " + subjectName
	htmlBody := "<p><strong>Name:</strong> " + esc(subjectName) + "</p>" +
		"<p><strong>Email:</strong> " + esc(replyTo) + "</p>" +
		"<p><strong>Message:</strong></p><p>" + strings.ReplaceAll(esc(body), "\n", "<br>") + "</p>"

	msg := "From: \"Anthro Contact\" <" + from + ">\r\n" +
		"To: " + to + "\r\n" +
		"Reply-To: " + replyTo + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		"\r\n" + htmlBody

	// Port 465: TLS from the start. Go's smtp.SendMail does STARTTLS; for 465 we need direct TLS.
	tlsConfig := &tls.Config{ServerName: host}
	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}
	defer client.Close()

	if err = client.Auth(auth); err != nil {
		return err
	}
	if err = client.Mail(from); err != nil {
		return err
	}
	if err = client.Rcpt(to); err != nil {
		return err
	}
	w, err := client.Data()
	if err != nil {
		return err
	}
	if _, err = w.Write([]byte(msg)); err != nil {
		return err
	}
	if err = w.Close(); err != nil {
		return err
	}
	return client.Quit()
}

// JWT claims for admin
type adminClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
}

func handleLogin(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"ok": false, "error": "Email and password are required"})
		return
	}
	email := strings.TrimSpace(body.Email)
	password := body.Password

	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminEmail == "" || adminPassword == "" {
		c.JSON(503, gin.H{"ok": false, "error": "Admin not configured"})
		return
	}
	if email != adminEmail || password != adminPassword {
		c.JSON(401, gin.H{"ok": false, "error": "Invalid email or password"})
		return
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		c.JSON(503, gin.H{"ok": false, "error": "Auth not configured"})
		return
	}

	claims := adminClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   email,
		},
		Email: email,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		fmt.Fprintf(os.Stderr, "jwt sign: %v\n", err)
		c.JSON(500, gin.H{"ok": false, "error": "Failed to issue token"})
		return
	}
	c.JSON(200, gin.H{"ok": true, "token": signed})
}

func handleAuthMe(c *gin.Context) {
	c.JSON(200, gin.H{"ok": true})
}

func jwtAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		const prefix = "Bearer "
		if !strings.HasPrefix(auth, prefix) {
			c.AbortWithStatusJSON(401, gin.H{"ok": false, "error": "Unauthorized"})
			return
		}
		tokenStr := strings.TrimSpace(auth[len(prefix):])
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			c.AbortWithStatusJSON(503, gin.H{"ok": false, "error": "Auth not configured"})
			return
		}
		var claims adminClaims
		token, err := jwt.ParseWithClaims(tokenStr, &claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected method: %v", t.Header["alg"])
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"ok": false, "error": "Invalid or expired token"})
			return
		}
		c.Set("adminEmail", claims.Email)
		c.Next()
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
