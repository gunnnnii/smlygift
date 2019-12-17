declare module "twitter-events" {
	type EventType = "message_create" | "";
	interface TwitterEvent {
		type: EventType;
		id: string;
		created_timestamp: string;
	}

	interface Message_create extends TwitterEvent {
		message_create: {
			target: {
				recipient_id: string;
			};
			sender_id: string;
			message_data: {
				text: string;
				entities: object;
			};
		};
	}
}
