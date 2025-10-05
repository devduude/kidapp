'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Idea {
  id: number;
  title: string;
  description: string;
  votes: number;
}

export default function Index() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [votedIdeaIds, setVotedIdeaIds] = useState<Set<number>>(new Set());
  const [voteCount, setVoteCount] = useState(0);
  const [excessClickCount, setExcessClickCount] = useState(0);
  const [votingInProgress, setVotingInProgress] = useState<number | null>(null);
  const [backendDown, setBackendDown] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'warning' | 'error'>('success');
  const [isNotificationHiding, setIsNotificationHiding] = useState(false);
  const lastClickTimeRef = useRef<Map<number, number>>(new Map());
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchIdeas();
    fetchVoteStatus();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`${API_URL}/ideas/random?limit=16`);
      if (!response.ok) {
        throw new Error('Backend responded with error');
      }
      const result = await response.json();
      const data = result.success ? result.data : result;
      const sortedIdeas = data.sort((a: Idea, b: Idea) => b.votes - a.votes);
      setIdeas(sortedIdeas);
      setBackendDown(false);
    } catch (error) {
      setBackendDown(true);
    } finally {
      setIdeasLoading(false);
    }
  };

  const fetchVoteStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/votes/status`);
      if (!response.ok) {
        throw new Error('Backend responded with error');
      }
      const result = await response.json();
      const data = result.success ? result.data : result;
      setVoteCount(data.voteCount);
      setVotedIdeaIds(new Set(data.votedIdeaIds));
      setBackendDown(false);
    } catch (error) {
      setBackendDown(true);
    }
  };

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setIsNotificationHiding(false);
    setNotification(message);
    setNotificationType(type);
    
    notificationTimeoutRef.current = setTimeout(() => {
      setIsNotificationHiding(true);
      
      setTimeout(() => {
        setNotification(null);
        setIsNotificationHiding(false);
        notificationTimeoutRef.current = null;
      }, 400);
    }, 4000);
  };

  const handleVoteClick = async (ideaId: number) => {
    if (votedIdeaIds.has(ideaId)) {
      showNotification('😊 You already voted for this one! Try another idea.', 'warning');
      return;
    }

    if (votingInProgress !== null) {
      return;
    }

    const now = Date.now();
    const lastClickTime = lastClickTimeRef.current.get(ideaId) || 0;
    const timeSinceLastClick = now - lastClickTime;
    
    if (timeSinceLastClick < 800) {
      return;
    }
    
    lastClickTimeRef.current.set(ideaId, now);
    
    setVotingInProgress(ideaId);

    try {
      const response = await fetch(`${API_URL}/ideas/${ideaId}/vote`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.status === 409) {
        const message = result.message || 'You have already voted';
        
        if (message.includes('maximum')) {
          setExcessClickCount(prev => prev + 1);
          showNotification('🎉 Wow! You\'ve used all 10 votes! Thank you for your input!', 'warning');
        } else if (message.includes('already voted')) {
          showNotification('😊 You already voted for this one! Try another idea.', 'warning');
          setVotedIdeaIds(prev => new Set([...prev, ideaId]));
        } else {
          showNotification(message, 'warning');
        }
        setVotingInProgress(null);
        return;
      }

      if (!response.ok) {
        showNotification('❌ Oops! Something went wrong. Please try again later.', 'error');
        setVotingInProgress(null);
        return;
      }

      const data = result.success ? result.data : result;

      setVotedIdeaIds(prev => new Set([...prev, ideaId]));
      setVoteCount(data.votesRemaining !== undefined ? 10 - data.votesRemaining : voteCount + 1);
      
      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === ideaId ? { ...idea, votes: data.votes } : idea
        )
      );
      
      showNotification('✅ Vote counted! Thank you!', 'success');
      setVotingInProgress(null);
    } catch (error) {
      showNotification('❌ Oops! Something went wrong. Please try again later.', 'error');
      setVotingInProgress(null);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.glassCard}>
          <h1 className={styles.title}>
            <span className={styles.wave}>💡</span>
            App Improvement Ideas
          </h1>
          
          {backendDown ? (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>🤖</span>
              <p className={styles.errorText}>
                Oops! Our data server seems to be taking a coffee break ☕<br />
                <span className={styles.errorSubtext}>It'll be back soon, we promise!</span>
              </p>
            </div>
          ) : (
            <>
              <p className={styles.instructions}>
                Please help us develop the most useful features, choose 10 that you like most.
              </p>
              
              <div className={styles.voteCounter}>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${(voteCount / 10) * 100}%` }}
                  />
                </div>
                <span className={styles.voteCountText}>
                  {excessClickCount > 0 
                    ? (
                      <>
                        That's enough, you may proceed with my resume:{" "}
                        <a 
                          href="https://resume.evgeniirodionov.ru" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'inherit', textDecoration: 'underline' }}
                        >
                          https://resume.evgeniirodionov.ru
                        </a>
                      </>
                    )
                    : `${voteCount}/10 clicks`
                  }
                </span>
              </div>
            </>
          )}

          <div className={styles.ideasSection}>
            {ideasLoading ? (
              <div className={styles.loadingIdeas}>
                <span className={styles.spinner}></span>
              </div>
            ) : (
              <div className={styles.ideasGrid}>
                {ideas.map((idea) => {
                  const isVoted = votedIdeaIds.has(idea.id);
                  const isVoting = votingInProgress === idea.id;
                  
                  return (
                    <div 
                      key={idea.id} 
                      className={`${styles.ideaCard} ${
                        isVoted ? styles.voted : styles.clickable
                      }`}
                      onClick={() => !isVoting && handleVoteClick(idea.id)}
                    >
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
                      <p className={styles.ideaDescription}>{idea.description}</p>
                      <div className={styles.ideaVotes}>
                        <span className={styles.voteIcon}>❤️</span>
                        <span className={styles.voteCount}>{idea.votes} votes</span>
                        {isVoted && <span className={styles.votedBadge}>✓ Voted</span>}
                        {isVoting && <span className={styles.spinner}></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <div className={`${styles.notification} ${styles[notificationType]} ${isNotificationHiding ? styles.hiding : ''}`}>
          {notification}
        </div>
      )}
    </>
  );
}
