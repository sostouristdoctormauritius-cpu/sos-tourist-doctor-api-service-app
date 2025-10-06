-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_ids UUID[] NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_participant_ids ON public.chat_rooms USING GIN (participant_ids);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_appointment_id ON public.chat_rooms(appointment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON public.chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Add comments for documentation
COMMENT ON TABLE public.chat_rooms IS 'Chat rooms for communication between users';
COMMENT ON COLUMN public.chat_rooms.participant_ids IS 'Array of user IDs participating in the chat';
COMMENT ON COLUMN public.chat_rooms.appointment_id IS 'Associated appointment ID (optional)';
COMMENT ON COLUMN public.chat_rooms.created_at IS 'Timestamp when the chat room was created';
COMMENT ON COLUMN public.chat_rooms.updated_at IS 'Timestamp when the chat room was last updated';

COMMENT ON TABLE public.chat_messages IS 'Individual messages within chat rooms';
COMMENT ON COLUMN public.chat_messages.chat_room_id IS 'Reference to the chat room';
COMMENT ON COLUMN public.chat_messages.sender_id IS 'ID of the user who sent the message';
COMMENT ON COLUMN public.chat_messages.content IS 'Content of the message';
COMMENT ON COLUMN public.chat_messages.created_at IS 'Timestamp when the message was sent';
COMMENT ON COLUMN public.chat_messages.updated_at IS 'Timestamp when the message was last updated';

-- Enable row level security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_rooms
CREATE POLICY "Users can view chat rooms they participate in" 
ON public.chat_rooms FOR SELECT 
USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms FOR INSERT 
WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update chat rooms they participate in" 
ON public.chat_rooms FOR UPDATE 
USING (auth.uid() = ANY(participant_ids));

-- Create policies for chat_messages
CREATE POLICY "Users can view messages in chat rooms they participate in" 
ON public.chat_messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.chat_room_id 
    AND auth.uid() = ANY(chat_rooms.participant_ids)
));

CREATE POLICY "Users can create messages in chat rooms they participate in" 
ON public.chat_messages FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.chat_room_id 
    AND auth.uid() = ANY(chat_rooms.participant_ids)
));

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages FOR UPDATE 
USING (sender_id = auth.uid());