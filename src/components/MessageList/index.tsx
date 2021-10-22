import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

import styles from './styles.module.scss';
import logo from '../../assets/logo.png';


type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  }
}

let messagesQueue: Message[] = [];

const socket = io('http://localhost:4000');

socket.on('new_message', (newMessage) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    api.get<Message[]>('messages/last3').then(response => {
      setMessages(response.data)
    })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0], 
          prevState[0], 
          prevState[1],
        ].filter(Boolean));

        messagesQueue.shift();
      }
    }, 3000);

    return () => {
      clearInterval(timer);
    }
  }, []);


    return (
        <div className={styles.messageListWrapper}>
          <img src={logo} alt="After Pandemic" />

            <ul className={styles.messageList}>
                {messages.map(message => {
                    return (
                        <motion.li
                        initial={{ opacity: 0, translateX: -80 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20
                        }}
                        className={styles.message} 
                        key={message.id}
                        >
                        <p className={styles.messageContent}>{message.text}</p>
                        <div className={styles.messageUser}>
                            <div className={styles.userImage}>
                            <img src={message.user.avatar_url} alt={message.user.name} />
                            </div>
                            <span>{message.user.name}</span>
                        </div>
                        </motion.li>
                    )
                })}
            </ul>
        </div>
    );
}