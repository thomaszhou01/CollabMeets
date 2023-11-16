package main

import (
	"context"
	"screenshare/chat/router"
)

func main() {
	ctx := context.Background()
	router.StartRouter(ctx)
}
