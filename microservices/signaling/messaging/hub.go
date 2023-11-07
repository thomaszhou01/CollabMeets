package messaging

import (
	"log"
	"screenshare/signaling/interfaces"

	"github.com/redis/go-redis/v9"
)

type Hub struct {
	Clients map[*Client]bool

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

	Action string

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
		Clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.Clients[client] = true
			if !h.entered {
				h.entered = true
				client.isHost = true
			}
			log.Println(len(h.Clients), " clients in hub ", &h)
		case client := <-h.unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.send)
				if h.entered && len(h.Clients) == 0 {
					log.Println("Hub ", &h, " closing")
					break
				}
			}
		case message := <-h.broadcast:
			for client := range h.Clients {
				if client.ClientId == message.From || (message.To != "" && client.ClientId != message.To) {
					continue
				}
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.Clients, client)
				}
			}
		default:
			if h.entered && len(h.Clients) == 0 {
				delete(*h.hub, h.hubID)
				log.Println("Hub ", &h, " closing. There are ", len(*h.hub), " hubs left")
				goto end
			}
		}

	}
end:
}
