package messaging

import (
	"fmt"
	"screenshare/signaling/interfaces"

	"github.com/redis/go-redis/v9"
)

type Hub struct {
	clients map[*Client]bool

	broadcast chan BroadcastMessage

	register chan *Client

	unregister chan *Client

	entered bool

	hubID string

	hub *map[string]*Hub

	redis *redis.Client
}

type BroadcastMessage struct {
	From string

	To string

	Data []byte

	WebsocketMessage interfaces.Message
}

func NewHub(hubID string, hub *map[string]*Hub, redis *redis.Client) *Hub {
	return &Hub{
		hub:        hub,
		hubID:      hubID,
		redis:      redis,
		broadcast:  make(chan BroadcastMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			if !h.entered {
				h.entered = true
				client.isHost = true
			}
			fmt.Println(len(h.clients), " clients in hub ", &h)
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				if h.entered && len(h.clients) == 0 {
					fmt.Println("Hub ", &h, " closing")
					break
				}
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				if client.clientId == message.From && (message.To != "" && client.clientId != message.To) {
					continue
				}
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		default:
			if h.entered && len(h.clients) == 0 {
				delete(*h.hub, h.hubID)
				fmt.Println("Hub ", &h, " closing. There are ", len(*h.hub), " hubs left")
				goto end
			}
		}

	}
end:
}
