import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { getRecentMessages, ChatMessage } from "@/services/chatService";

interface UseChatProps {
    roomId: string;
    userId: string;
    senderNickname: string;
}

export function useChat({ roomId, userId, senderNickname }: UseChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    // 과거 대화 내역 불러오기
    useEffect(() => {
        if (!roomId) return;

        getRecentMessages(roomId)
            .then((history) => {
                // DB에서 불러온 내역은 역순(최신순)일 수 있으므로 시간 정렬 확인
                const sortedHistory = [...history].sort((a, b) => {
                    const idA = a.id || 0;
                    const idB = b.id || 0;
                    return idA - idB;
                });
                setMessages(sortedHistory);
            })
            .catch((err) => {
                console.error("Failed to load chat history:", err);
            });
    }, [roomId]);

    // WebSocket 연결 설정
    useEffect(() => {
        if (!roomId || !userId) return;

        // WebSocket 주소 결정 (현재 프로토콜에 따라 ws:// 또는 wss:// 분기)
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        // Nginx가 포트포워딩하는 /ws-stomp 엔드포인트 사용
        const brokerURL = `${protocol}//${host}/ws-stomp`;

        const client = new Client({
            brokerURL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setIsConnected(true);
                console.log(`STOMP Connected to Room [${roomId}]`);

                // 채팅방 구독 시작
                client.subscribe(`/sub/chat/room/${roomId}`, (message: IMessage) => {
                    const receivedMessage: ChatMessage = JSON.parse(message.body);
                    setMessages((prev) => {
                        // 중복 수신 방지 처리 (id가 있을 경우 체크)
                        if (receivedMessage.id && prev.some((m) => m.id === receivedMessage.id)) {
                            return prev;
                        }
                        return [...prev, receivedMessage];
                    });
                });

                // 입장 메시지 전송
                client.publish({
                    destination: "/pub/chat/message",
                    body: JSON.stringify({
                        roomId,
                        sender: senderNickname,
                        type: "ENTER",
                        message: `${senderNickname}님이 입장하셨습니다.`,
                    }),
                });
            },
            onDisconnect: () => {
                setIsConnected(false);
                console.log("STOMP Disconnected");
            },
            onStompError: (frame) => {
                console.error("STOMP Broker Error: " + frame.headers["message"]);
                console.error("STOMP Details: " + frame.body);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                // 퇴장 메시지 전송 시도 후 비활성화
                if (clientRef.current.connected) {
                    clientRef.current.publish({
                        destination: "/pub/chat/message",
                        body: JSON.stringify({
                            roomId,
                            sender: senderNickname,
                            type: "LEAVE",
                            message: `${senderNickname}님이 퇴장하셨습니다.`,
                        }),
                    });
                }
                clientRef.current.deactivate();
                console.log("STOMP Deactivated");
            }
            setIsConnected(false);
        };
    }, [roomId, userId, senderNickname]);

    // 메시지 발송 함수
    const sendMessage = useCallback((text: string) => {
        if (!clientRef.current || !clientRef.current.connected) {
            console.warn("Cannot send message: STOMP connection not active");
            return;
        }

        clientRef.current.publish({
            destination: "/pub/chat/message",
            body: JSON.stringify({
                roomId,
                sender: senderNickname,
                type: "TALK",
                message: text,
            }),
        });
    }, [roomId, senderNickname]);

    return {
        messages,
        isConnected,
        sendMessage,
    };
}
