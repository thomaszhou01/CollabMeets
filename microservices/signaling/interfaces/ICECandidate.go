package interfaces

type ICECandidate struct {
	Candidate        string
	SdpMid           string
	SdpMLineIndex    int
	UsernameFragment string
}
