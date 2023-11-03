package interfaces

type Message struct {
	User          string
	ActionCode    string
	Target        string
	IceCandidates []ICECandidate
}
