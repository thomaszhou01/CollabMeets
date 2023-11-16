package interfaces

type ICECandidate struct {
	Candidate        string
	SdpMid           string
	SdpMLineIndex    int
	UsernameFragment string
}

type Message struct {
	User          string
	Username      string
	ActionCode    string
	Target        string
	IceCandidates ICECandidate
	PCOffer       PCOffer
}

type PCOffer struct {
	Sdp  string
	Type string
}
