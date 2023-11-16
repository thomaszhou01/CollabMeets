package postgres

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var postgresDB *sql.DB

func PostgresInit() *sql.DB {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
	postgresHost, _ := os.LookupEnv("POSTGRES_HOST")
	postgresPassword, _ := os.LookupEnv("POSTGRES_PASSWORD")

	connStr := "host=" + postgresHost + " dbname=postgres user=postgres password=" + postgresPassword
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

func Query() {
	rows, err := postgresDB.Query("SELECT * FROM test;")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(rows)
	for rows.Next() {
		var id int
		var first string
		var last string

		err = rows.Scan(&id, &first, &last)
		if err != nil {
			log.Println(err)
		}
		fmt.Println(id, first, last)
	}
}
