package interfaces

type Message struct {
	User          string
	Username      string
	ActionCode    string
	Target        string
	IceCandidates ICECandidate
	PCOffer       PCOffer
}
