package chat

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"
)

type ChatHistory struct {
	RoomId   string
	Messages []ChatHistoryMessage
}

type ChatHistoryMessage struct {
	From    string
	Message string
}

func QueryUser(userId string, postgres *sql.DB) bool {
	rows, err := postgres.Query("SELECT COUNT(1) FROM users WHERE user_id = $1", userId)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	var id int
	rows.Next()
	err = rows.Scan(&id)
	if err != nil {
		log.Println(err)
	}

	if id == 1 {
		return true
	}
	return false
}

func RegisterUser(userId string, username string, postgres *sql.DB) {
	_, err := postgres.Exec("INSERT INTO users (user_id, username) VALUES ($1, $2)", userId, username)
	if err != nil {
		log.Println(err)
	}
}

func QueryRoom(roomId string, postgres *sql.DB) bool {
	rows, err := postgres.Query("SELECT COUNT(1) FROM chats WHERE roomid = $1 AND active = true", roomId)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	var id int
	rows.Next()
	err = rows.Scan(&id)
	if err != nil {
		log.Println(err)
	}

	if id == 1 {
		return true
	}
	return false
}

func EnterChatRoom(userId string, chatId string, postgres *sql.DB) {
	rows, err := postgres.Query("SELECT COUNT(1) FROM user_chat WHERE user_id = $1 AND chat_id = $2", userId, chatId)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	var id int
	rows.Next()
	err = rows.Scan(&id)
	if err != nil {
		log.Println(err)
	}

	if id == 0 {
		_, err = postgres.Exec("INSERT INTO user_chat (user_id, chat_id) VALUES ($1, $2)", userId, chatId)
		if err != nil {
			log.Println(err)
		}
	}
}

func CreateRoom(roomId string, postgres *sql.DB) bool {
	_, err := postgres.Exec("INSERT INTO chats (roomid, active) VALUES ($1, $2)", roomId, true)
	if err != nil {
		log.Println(err)
		return false
	}
	return true
}

func CloseRoom(context context.Context, postgres *sql.DB, redis *redis.Client) {
	pubsub := redis.Subscribe(context, "closeRoom")
	defer pubsub.Close()

	for {
		ch := pubsub.Channel()

		for msg := range ch {
			_, err := postgres.Exec("UPDATE chats SET active = false WHERE roomid = $1", msg.Payload)
			if err != nil {
				log.Println("create room err", err)
			}
		}
	}
}

func GetUserChatMessages(userId string, postgres *sql.DB) string {
	rows, err := postgres.Query("SELECT chat_id FROM user_chat WHERE user_id = $1", userId)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	chatHistory := make([]ChatHistory, 0)
	for rows.Next() {
		//get the chat id
		var chatId string
		err = rows.Scan(&chatId)
		if err != nil {
			log.Println(err)
		}

		//get the messages in that chat
		chatRows, err := postgres.Query("SELECT user_id, content FROM messages WHERE chat_id = $1", chatId)
		if err != nil {
			log.Println(err)
		}
		defer chatRows.Close()

		chatHistoryMessages := make([]ChatHistoryMessage, 0)
		for chatRows.Next() {
			var from string
			var content string

			err = chatRows.Scan(&from, &content)
			if err != nil {
				log.Println(err)
			}
			chatHistoryMessages = append(chatHistoryMessages, ChatHistoryMessage{From: from, Message: content})
		}
		chatHistory = append(chatHistory, ChatHistory{RoomId: chatId, Messages: chatHistoryMessages})
	}
	messageJson, errJson := json.Marshal(chatHistory)
	if errJson != nil {
		log.Println(errJson)
	}
	return string(messageJson)
}
