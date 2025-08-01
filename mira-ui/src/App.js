import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainContent from "./MainContent";
import LoadingScreen from "./LoadingScreen";
import SignInPanel from "./SignInPanel";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import "./App.css";
import ConnectionsPage from "./ConnectionsPage";
import TypingParagraph from "./TypingParagraph";
import { supabaseAuth, supabaseDB } from './supabase';
import { useRealDataSearch } from './RealDataSearch';

// Network Dot Component
function NetworkDot({ enabled = false, onToggle, darkMode = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseEnter = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6, 
        marginLeft: 8,
        position: 'relative'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => onToggle(!enabled)}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: enabled ? '#4CAF50' : '#f44336',
          border: 'none',
          cursor: 'pointer',
          boxShadow: enabled ? '0 0 8px rgba(76, 175, 80, 0.6)' : '0 0 8px rgba(244, 67, 54, 0.6)',
          transition: 'background 0.2s ease',
        }}
      />
      <span style={{ 
        color: '#999', 
        fontSize: '0.85rem',
        fontWeight: 400,
        letterSpacing: 0.05,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        Network only
      </span>
      
      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%)',
            backgroundColor: darkMode ? '#2a2a2a' : '#fff',
            color: darkMode ? '#f5f5f5' : '#222',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 400,
            boxShadow: darkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px #444' 
              : '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px #e0e0e0',
            border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
            zIndex: 10000,
            whiteSpace: 'nowrap',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          Click to search only within your network
        </div>
      )}
    </div>
  );
}

// Supabase configuration
// TODO: Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function SearchResults({ darkMode, isSidebarCollapsed, onSignUpClick, user, isAuthenticated, starredUsers = [], onToggleStarUser }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  // Function to generate personalized overview based on scraped data
  const generatePersonalizedOverview = (person) => {
    if (!person) return `${person.name} is a professional in their field with experience shared through their social media presence.`;
    
    const comprehensiveData = person.comprehensive_twitter_data;
    const aiProfile = person.ai_profile || {};
    const quotes = person.quotes || [];
    
    let overview = `${person.name}`;
    
    // Check if we have comprehensive data
    if (comprehensiveData) {
      // Use comprehensive data if available
      if (comprehensiveData.verified) {
        overview += ` is a verified professional`;
      } else {
        overview += ` is a professional`;
      }
      
      if (comprehensiveData.location) {
        overview += ` based in ${comprehensiveData.location}`;
      }
      
      if (comprehensiveData.followers_count > 10000) {
        overview += ` with a substantial following of ${(comprehensiveData.followers_count/1000).toFixed(1)}K followers`;
      } else if (comprehensiveData.followers_count > 1000) {
        overview += ` with ${(comprehensiveData.followers_count/1000).toFixed(1)}K followers`;
      } else if (comprehensiveData.followers_count > 100) {
        overview += ` with ${comprehensiveData.followers_count} followers`;
      }
      
      if (comprehensiveData.description) {
        overview += `. ${comprehensiveData.description.substring(0, 100)}${comprehensiveData.description.length > 100 ? '...' : ''}`;
      }
    } else {
      // Use basic data
      overview += ` is a professional`;
      
      if (person.type) {
        overview += ` in the ${person.type} category`;
      }
      
      if (quotes.length > 0) {
        overview += ` with an active social media presence`;
      }
      
      // Use AI profile data if available
      if (aiProfile.overview) {
        overview += `. ${aiProfile.overview.substring(0, 100)}${aiProfile.overview.length > 100 ? '...' : ''}`;
      }
    }
    
    overview += '.';
    
    return overview;
  };

  // Function to generate personalized match reasons based on scraped data
  const generatePersonalizedMatchReasons = (person) => {
    if (!person) return [];
    
    const reasons = [];
    const comprehensiveData = person.comprehensive_twitter_data;
    const aiProfile = person.ai_profile || {};
    const quotes = person.quotes || [];
    
    // Reason 1: Network size (if comprehensive data available)
    if (comprehensiveData && comprehensiveData.followers_count > 1000) {
      reasons.push({
        text: `Strong Network (${(comprehensiveData.followers_count/1000).toFixed(1)}K followers)`,
        description: `Large professional network indicates influence and credibility in their field`
      });
    } else if (comprehensiveData && comprehensiveData.followers_count > 100) {
      reasons.push({
        text: `Growing Network (${comprehensiveData.followers_count} followers)`,
        description: `Active community member with expanding professional connections`
      });
    }
    
    // Reason 2: Activity level
    if (quotes.length > 0) {
      reasons.push({
        text: `Active Social Media Presence`,
        description: `Consistent online activity shows ongoing engagement and thought leadership`
      });
    }
    
    // Reason 3: Content quality
    if (quotes.length > 0) {
      reasons.push({
        text: `Content Creator`,
        description: `Shares valuable insights and contributes to professional discussions`
      });
    }
    
    // Reason 4: Verification (if comprehensive data available)
    if (comprehensiveData && comprehensiveData.verified) {
      reasons.push({
        text: `Verified Professional`,
        description: `Official verification confirms their professional status and credibility`
      });
    }
    
    // Reason 5: AI Profile insights
    if (aiProfile.predictedInterests && aiProfile.predictedInterests.length > 0) {
      const interests = aiProfile.predictedInterests.slice(0, 2).join(' and ');
      reasons.push({
        text: `Expertise in ${interests}`,
        description: `Specialized knowledge in areas that align with your professional interests`
      });
    }
    
    // Reason 6: Location match (if comprehensive data available)
    if (comprehensiveData && comprehensiveData.location && user?.location) {
      reasons.push({
        text: `Location Match (${comprehensiveData.location})`,
        description: `Geographic proximity can facilitate in-person networking opportunities`
      });
    }
    
    // Reason 7: Professional type
    if (person.type) {
      reasons.push({
        text: `${person.type.charAt(0).toUpperCase() + person.type.slice(1)} Connection`,
        description: `Connected through ${person.type} relationship, indicating shared professional interests`
      });
    }
    
    // Fill up to 3 reasons
    while (reasons.length < 3) {
      reasons.push({
        text: `Professional Background`,
        description: `Based on their social media presence and network connections`
      });
    }
    
    return reasons.slice(0, 3); // Return top 3 reasons
  };
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(query);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  // Follow-up search bar state and handlers
  const [followupValue, setFollowupValue] = useState("");
  const [networkOnly, setNetworkOnly] = useState(false);
  const followupRef = useRef();
  const editTextRef = useRef();

  // Use real data search for any query
  const { people: realPeople, keywords: realKeywords, explanation: realExplanation, loading: searchLoading, noStrongConnections } = useRealDataSearch(
    query.trim() || '',
    'demo@mira.com'
  );

  const navigate = useNavigate();
  
  // Debug logging for real data search
  useEffect(() => {
    if (query.trim()) {
      console.log('🔍 Search Query:', query.trim());
      console.log('📊 Real People Count:', realPeople.length);
      console.log('⏳ Search Loading:', searchLoading);
      console.log('💬 Real Explanation:', realExplanation);
    }
  }, [query, realPeople.length, searchLoading, realExplanation]);


  
  // Share button state
  const [shareCopied, setShareCopied] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const questionRef = useRef();
  const hiddenDivRef = useRef();
  const [showPeopleCards, setShowPeopleCards] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [thinkingDots, setThinkingDots] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showConnectDropdown, setShowConnectDropdown] = useState(false);
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const [completedQueries, setCompletedQueries] = useState(() => {
    // Load completed queries from localStorage on initialization
    const saved = localStorage.getItem('mira_completed_queries');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [profileAnimated, setProfileAnimated] = useState({
    header: false,
    overview: false,
    workExperience: false,
    contact: false
  });
  const [showMoreTimeline, setShowMoreTimeline] = useState(false);
  const [connectButtonRef, setConnectButtonRef] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [hoveredPattern, setHoveredPattern] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [profileSlideUp, setProfileSlideUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [followupSent, setFollowupSent] = useState(() => {
    // Load follow-up sent state from localStorage
    const saved = localStorage.getItem(`mira_followup_sent_${query.trim()}`);
    return saved === 'true';
  });
  const [sentMessage, setSentMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [followupQuery, setFollowupQuery] = useState(() => {
    // Load follow-up query from localStorage
    const saved = localStorage.getItem(`mira_followup_query_${query.trim()}`);
    return saved || "";
  });
  const [followupHovered, setFollowupHovered] = useState(false);
  const [followupCopied, setFollowupCopied] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState(() => {
    // Load filtered people from localStorage
    const saved = localStorage.getItem(`mira_filtered_people_${query.trim()}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reconstruct the avatarIcon for each person since it can't be serialized
        return parsed.map(person => ({
          ...person,
          avatarIcon: undefined // Will be regenerated by the component
        }));
      } catch (e) {
        console.error('Error parsing filtered people from localStorage:', e);
        return [];
      }
    }
    return [];
  });
  const [filteredAnimationsCompleted, setFilteredAnimationsCompleted] = useState(() => {
    // Load filtered animations state from localStorage
    const saved = localStorage.getItem(`mira_filtered_animations_${query.trim()}`);
    return saved === 'true';
  });

  // Effect to show sticky bar when question is out of view
  useEffect(() => {
    const handleScroll = () => {
      if (!questionRef.current) return;
      const rect = questionRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
      
      // Handle profile slide animation only when viewing a specific person profile
      if (selectedPerson) {
        const currentScrollY = window.scrollY;
        if (profileSlideUp && currentScrollY < lastScrollY && currentScrollY < 50) {
          // Scrolling up and near the top - reveal profile with smooth transition
          setProfileSlideUp(false);
          setFollowupSent(false);
          setSentMessage("");
        }
        setLastScrollY(currentScrollY);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [profileSlideUp, lastScrollY, selectedPerson]);

  useEffect(() => {
    if (editing && editTextRef.current) {
      const len = editTextRef.current.value.length;
      editTextRef.current.setSelectionRange(len, len);
      editTextRef.current.focus();
    }
  }, [editing]);

  // Keep editValue in sync with query when query changes (for sidebar switching)
  useEffect(() => {
    setEditValue(query);
  }, [query]);

  // Save follow-up state to localStorage when it changes
  useEffect(() => {
    if (query.trim()) {
      localStorage.setItem(`mira_followup_query_${query.trim()}`, followupQuery);
      localStorage.setItem(`mira_followup_sent_${query.trim()}`, followupSent.toString());
      
      // Save filtered people without React elements
      const serializableFilteredPeople = filteredPeople.map(person => {
        const { avatarIcon, ...serializablePerson } = person;
        return serializablePerson;
      });
      localStorage.setItem(`mira_filtered_people_${query.trim()}`, JSON.stringify(serializableFilteredPeople));
      
      localStorage.setItem(`mira_filtered_animations_${query.trim()}`, filteredAnimationsCompleted.toString());
    }
  }, [query, followupQuery, followupSent, filteredPeople, filteredAnimationsCompleted]);

  // Add save function to window for external access
  useEffect(() => {
    window.saveFollowupState = () => {
      if (query.trim()) {
        localStorage.setItem(`mira_followup_query_${query.trim()}`, followupQuery);
        localStorage.setItem(`mira_followup_sent_${query.trim()}`, followupSent.toString());
        
        // Save filtered people without React elements
        const serializableFilteredPeople = filteredPeople.map(person => {
          const { avatarIcon, ...serializablePerson } = person;
          return serializablePerson;
        });
        localStorage.setItem(`mira_filtered_people_${query.trim()}`, JSON.stringify(serializableFilteredPeople));
        
        localStorage.setItem(`mira_filtered_animations_${query.trim()}`, filteredAnimationsCompleted.toString());
      }
    };

    // Cleanup function to remove from window when component unmounts
    return () => {
      delete window.saveFollowupState;
    };
  }, [query, followupQuery, followupSent, filteredPeople, filteredAnimationsCompleted]);

  // Save state when component unmounts (like when clicking "New Chat")
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      if (query.trim()) {
        localStorage.setItem(`mira_followup_query_${query.trim()}`, followupQuery);
        localStorage.setItem(`mira_followup_sent_${query.trim()}`, followupSent.toString());
        
        // Save filtered people without React elements
        const serializableFilteredPeople = filteredPeople.map(person => {
          const { avatarIcon, ...serializablePerson } = person;
          return serializablePerson;
        });
        localStorage.setItem(`mira_filtered_people_${query.trim()}`, JSON.stringify(serializableFilteredPeople));
        
        localStorage.setItem(`mira_filtered_animations_${query.trim()}`, filteredAnimationsCompleted.toString());
      }
    };
  }, [query, followupQuery, followupSent, filteredPeople, filteredAnimationsCompleted]);

  // Trigger filtered animations after a delay
  useEffect(() => {
    if (followupSent && filteredPeople.length > 0 && !filteredAnimationsCompleted) {
      const timer = setTimeout(() => {
        setFilteredAnimationsCompleted(true);
      }, 500); // Start animations after 500ms
      return () => clearTimeout(timer);
    }
  }, [followupSent, filteredPeople.length, filteredAnimationsCompleted]);

  // Sync textarea height to hidden div
  useEffect(() => {
    if (editing && editTextRef.current && hiddenDivRef.current) {
      const hiddenDiv = hiddenDivRef.current;
      const textarea = editTextRef.current;
      // Set textarea height to match hidden div
      textarea.style.height = hiddenDiv.offsetHeight + 'px';
    }
  }, [editValue, editing]);

  // Show AI response and people cards with proper timing
  useEffect(() => {
    if (query.trim()) {
      // Don't start animations if we're currently viewing a profile
      if (selectedPerson !== null) {
        return;
      }
      
      // Check if this query has already been completed (returning to existing chat)
      const isReturningToCompletedQuery = completedQueries.has(query.trim());
      
      // If returning to a completed query, show everything immediately
      if (isReturningToCompletedQuery) {
        setShowAIResponse(true);
        setShowPeopleCards(true);
        setThinkingDots('');
        setAnimationsCompleted(true);
        return;
      }
      
      // If animations were already completed for current session, show everything immediately
      if (animationsCompleted) {
        setShowAIResponse(true);
        setShowPeopleCards(true);
        setThinkingDots('');
        return;
      }
      
      // Start fresh animations only on first visit to a new query
      setShowAIResponse(false);
      setShowPeopleCards(false);
      setThinkingDots('');
      
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setThinkingDots('.'.repeat(dotCount));
      }, 400);
      
      // Show AI response after thinking
      const aiTimer = setTimeout(() => {
        setShowAIResponse(true);
        clearInterval(dotsInterval);
      }, 3200);
      
      // Show people cards after typing animation completes (3.2s thinking + ~3.25s typing + 0.4s buffer)
      const cardsTimer = setTimeout(() => {
        setShowPeopleCards(true);
        setAnimationsCompleted(true); // Mark animations as completed
        // Add this query to completed queries set
        setCompletedQueries(prev => new Set([...prev, query.trim()]));
      }, 6850);
      
      return () => {
        clearTimeout(aiTimer);
        clearTimeout(cardsTimer);
        clearInterval(dotsInterval);
      };
    } else {
      setShowAIResponse(false);
      setShowPeopleCards(false);
      setThinkingDots('');
      setAnimationsCompleted(false); // Reset for other queries
    }
  }, [query, selectedPerson, animationsCompleted, completedQueries]);

  // Save completed queries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mira_completed_queries', JSON.stringify([...completedQueries]));
  }, [completedQueries]);

  // Trigger profile fade-down animation with staggered timing
  useEffect(() => {
    if (selectedPerson) {
      // Reset all sections
      setProfileAnimated({
        header: false,
        overview: false,
        workExperience: false,
        contact: false
      });
      
      // Stagger each section with delays
      const timers = [
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, header: true })), 100),
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, overview: true })), 300),
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, workExperience: true })), 500),
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, contact: true })), 700)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } else {
      setProfileAnimated({
        header: false,
        overview: false,
        workExperience: false,
        contact: false
      });
    }
  }, [selectedPerson]);

  // Reset slide states when navigating away from a profile
  useEffect(() => {
    if (!selectedPerson) {
      setProfileSlideUp(false);
      setFollowupSent(false);
      setSentMessage("");
    }
  }, [selectedPerson]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showConnectDropdown && !event.target.closest('.connect-dropdown-container')) {
        setShowConnectDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConnectDropdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  const handleEdit = () => {
    setEditValue(query);
    setEditing(true);
  };
  const handleEditConfirm = () => {
    // If you want to update the URL/query, do it here (not implemented)
    setEditing(false);
  };
  const handleEditCancel = () => {
    setEditing(false);
    setEditValue(query);
  };
  const handleFollowupInput = (e) => {
    setFollowupValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    // Only handle profile slide animation when viewing a specific person profile
    if (selectedPerson) {
      // Reset sent state when user starts typing again
      if (followupSent) {
        setFollowupSent(false);
        setSentMessage("");
      }
      
      // Slide profile back down when input is completely cleared
      if (e.target.value.length === 0 && profileSlideUp) {
        setProfileSlideUp(false);
        setFollowupSent(false);
        setSentMessage("");
      }
    } else {
      // Only reset if user completely clears the input and starts a completely new follow-up
      if (followupSent && e.target.value.length === 0) {
        // Don't reset immediately, let user see the current follow-up results
        // Only reset if they start typing something completely different
      }
    }
  };

  const handleFollowupKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowupSubmit();
    }
  };

  const handleFollowupSubmit = () => {
    if (followupValue.trim()) {
      // Only trigger profile slide animation when viewing a specific person profile
      if (selectedPerson) {
        // Store the message before clearing the input
        setSentMessage(followupValue.trim());
        // Mark message as sent and trigger profile slide
        setFollowupSent(true);
        setProfileSlideUp(true);
      } else {
        // Mark that a follow-up was sent for the main search view
        setFollowupSent(true);
        // Store the follow-up query
        setFollowupQuery(followupValue.trim());
        // Filter the original people based on the follow-up query
        const filtered = filterPeopleByFollowup(realPeople, followupValue.trim());
        setFilteredPeople(filtered);
        setFilteredAnimationsCompleted(false);
        // Scroll to position the follow-up query at the top of the view
        setTimeout(() => {
          // Find the follow-up query element and scroll to it
          const followupQueryElement = document.querySelector('[data-testid="followup-query"]');
          if (followupQueryElement) {
            followupQueryElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          } else {
            // Fallback: scroll to a position that shows the follow-up query
            window.scrollTo({ 
              top: window.scrollY + 400, 
              behavior: 'smooth' 
            });
          }
        }, 100); // Small delay to ensure the search results are updated
      }
      // Clear the input after sending
      setFollowupValue("");
      // Here you would typically send the message to your backend
      console.log('Sending follow-up:', followupValue);
    }
  };


  // Share button handler
  const handleShare = () => {
    const url = `${window.location.origin}/search?q=${encodeURIComponent(query)}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1200);
  };

  // Related click handler
  const handleRelatedClick = (text) => {
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setEditValue(text);
    setFollowupValue("");
  };

  // Follow-up query handlers
  const handleFollowupCopy = () => {
    navigator.clipboard.writeText(followupQuery);
    setFollowupCopied(true);
    setTimeout(() => setFollowupCopied(false), 1200);
  };

  const handleFollowupEdit = () => {
    // For now, just copy the follow-up query to the main search
    navigate(`/search?q=${encodeURIComponent(followupQuery)}`);
    setEditValue(followupQuery);
  };

  const handleClearFollowup = () => {
    setFollowupSent(false);
    setFollowupQuery("");
    setFilteredPeople([]);
    setFilteredAnimationsCompleted(false);
    setFollowupValue("");
    
    // Clear from localStorage
    if (query.trim()) {
      localStorage.removeItem(`mira_followup_query_${query.trim()}`);
      localStorage.removeItem(`mira_followup_sent_${query.trim()}`);
      localStorage.removeItem(`mira_filtered_people_${query.trim()}`);
      localStorage.removeItem(`mira_filtered_animations_${query.trim()}`);
    }
  };

  // Handle card click with scroll to top
  const handleCardClick = (person, isFromFollowup = false) => {
    if (person.name !== 'Searching...' && person.name !== 'No Results' && person.name !== 'No Strong Connections') {
      setSelectedPerson({...person, isFromFollowup});
      // Scroll to top to show the user profile
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'auto' 
        });
      }, 100); // Small delay to ensure the profile is rendered
    }
  };

  // Filter original people based on follow-up query
  const filterPeopleByFollowup = (originalPeople, followupText) => {
    if (!followupText || !originalPeople.length) return [];
    
    // Convert follow-up text to lowercase for matching
    const followupLower = followupText.toLowerCase();
    
    // Define specific criteria patterns
    const criteria = {
      aiStartup: {
        keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'startup', 'founder', 'ceo', 'entrepreneur'],
        required: ['ai', 'startup'],
        optional: ['recent', 'recently', 'posted', 'tweet', 'shared']
      },
      recentActivity: {
        keywords: ['recent', 'recently', 'latest', 'new', 'current', 'posted', 'tweet', 'shared'],
        required: ['recent'],
        optional: ['posted', 'tweet', 'shared']
      },
      specificTech: {
        keywords: ['ai', 'machine learning', 'blockchain', 'web3', 'cloud', 'mobile', 'frontend', 'backend'],
        required: [],
        optional: []
      }
    };
    
    // Analyze the follow-up text to determine what we're looking for
    const analysis = {
      lookingForAI: followupLower.includes('ai') || followupLower.includes('artificial intelligence') || followupLower.includes('machine learning'),
      lookingForStartup: followupLower.includes('startup') || followupLower.includes('founder') || followupLower.includes('entrepreneur'),
      lookingForRecent: followupLower.includes('recent') || followupLower.includes('recently'),
      lookingForPosted: followupLower.includes('post') || followupLower.includes('tweet') || followupLower.includes('shared'),
      lookingForSpecific: followupLower.includes('if they') || followupLower.includes('who') || followupLower.includes('that')
    };
    
    return originalPeople.filter(person => {
      const quote = person.quote?.toLowerCase() || '';
      const name = person.name?.toLowerCase() || '';
      const comprehensiveData = person.comprehensive_twitter_data;
      
      // Create a score-based system
      let score = 0;
      let matches = [];
      
      // Check for AI startup criteria
      if (analysis.lookingForAI && analysis.lookingForStartup) {
        const aiStartupKeywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'startup', 'founder', 'ceo', 'entrepreneur', 'company', 'business'];
        const hasAIContent = aiStartupKeywords.some(keyword => quote.includes(keyword));
        const hasStartupContent = quote.includes('startup') || quote.includes('founder') || quote.includes('ceo') || quote.includes('entrepreneur');
        
        if (hasAIContent && hasStartupContent) {
          score += 10;
          matches.push('ai_startup');
        } else if (hasAIContent || hasStartupContent) {
          score += 5;
          matches.push('partial_ai_startup');
        }
      }
      
      // Check for recent activity
      if (analysis.lookingForRecent) {
        const recentKeywords = ['recent', 'recently', 'latest', 'new', 'current', 'today', 'yesterday', 'this week', 'this month'];
        const hasRecentContent = recentKeywords.some(keyword => quote.includes(keyword));
        
        if (hasRecentContent) {
          score += 8;
          matches.push('recent_activity');
        }
      }
      
      // Check for posted content
      if (analysis.lookingForPosted) {
        const postKeywords = ['posted', 'tweet', 'tweeted', 'shared', 'wrote', 'mentioned', 'said'];
        const hasPostContent = postKeywords.some(keyword => quote.includes(keyword));
        
        if (hasPostContent) {
          score += 6;
          matches.push('posted_content');
        }
      }
      
      // Check for specific tech mentions
      if (analysis.lookingForSpecific) {
        const techKeywords = ['ai', 'machine learning', 'blockchain', 'web3', 'cloud', 'mobile', 'frontend', 'backend', 'react', 'python', 'javascript'];
        const hasTechContent = techKeywords.some(keyword => quote.includes(keyword));
        
        if (hasTechContent) {
          score += 4;
          matches.push('tech_mention');
        }
      }
      
      // Bonus for comprehensive data
      if (comprehensiveData) {
        if (comprehensiveData.description) {
          const desc = comprehensiveData.description.toLowerCase();
          if (analysis.lookingForAI && desc.includes('ai')) score += 3;
          if (analysis.lookingForStartup && (desc.includes('startup') || desc.includes('founder'))) score += 3;
        }
      }
      
      // Only return people with a meaningful score
      return score >= 5;
    }).sort((a, b) => {
      // Sort by relevance (you could implement a more sophisticated scoring system here)
      const aScore = calculatePersonScore(a, followupLower);
      const bScore = calculatePersonScore(b, followupLower);
      return bScore - aScore;
    }).slice(0, Math.min(5, originalPeople.length)); // Return top 5 most relevant
  };
  
  // Helper function to calculate a more detailed score for sorting
  const calculatePersonScore = (person, followupText) => {
    const quote = person.quote?.toLowerCase() || '';
    let score = 0;
    
    // Exact phrase matches get highest score
    if (followupText.includes('ai startup') && quote.includes('ai') && quote.includes('startup')) {
      score += 20;
    }
    
    // Individual keyword matches
    if (followupText.includes('ai') && quote.includes('ai')) score += 8;
    if (followupText.includes('startup') && quote.includes('startup')) score += 8;
    if (followupText.includes('recent') && quote.includes('recent')) score += 6;
    if (followupText.includes('posted') && quote.includes('posted')) score += 6;
    
    // Quote length bonus (more content = potentially more relevant)
    if (quote.length > 100) score += 2;
    
    return score;
  };

  // --- MOCKUP TEXT ---
  const aiTrendsText = `The latest trends in AI for 2025 center on several key shifts, impacting both technological development and real-world applications:\nAI Reasoning & Agentic AI: Large language models (LLMs) and frontier models are moving beyond mere text generation to advanced reasoning—enabling tools that can interpret, decide, and act on complex tasks. The concept of agentic AI is gaining momentum, with AI agents working autonomously to simplify work and personal life, signaling a shift from passive tools to active collaborators.\nCustom Silicon and Efficiency: As the demand for AI computational power rises, companies are turning to custom silicon—specialized processors designed for AI workloads—to optimize performance and manage energy use. AI is also becoming more resource-efficient, driven by innovations to manage costs and environmental concerns.\nMultimodal and Embodied AI: AI is rapidly expanding past text into multimodal models that combine language, images, video, and audio, as seen in tools like OpenAI's Sora. This enables more dynamic and versatile AI systems. Additionally, embodied AI—where AI powers robots and interacts with the physical world—is progressing, signaling improvements in robotics and automated systems.\nBeyond Chatbots: The focus is shifting away from simple conversational interfaces. Instead, businesses are building software that leverages foundational AI models as back-end infrastructure, deploying generative AI for tasks such as summarizing, analyzing, or autonomously acting on unstructured data.\nAI in Scientific Discovery & Healthcare: AI-driven breakthroughs in science and medicine are accelerating, especially in fields like drug discovery, climate science, and materials engineering. AI-powered research is unlocking solutions to intricate challenges in biomedicine and sustainability.\nMainstream Adoption & Tangible Productivity Gains: Usage of AI in business is skyrocketing, with 78% of organizations adopting AI in 2024 compared to 55% in 2023. The technology is driving productivity gains, skill gap narrowing, and new business models across industries.\nMeasuring AI Efficacy and Responsible AI: With increased adoption comes a greater emphasis on evaluating AI performance and mitigating risks, including privacy, safety, and ethical concerns. Businesses and regulators are developing new benchmarks and metrics for AI effectiveness and trustworthiness.\nCloud Migrations and AI Workloads: Hyperscalers (cloud giants) are investing in infrastructure to accommodate surges in AI workloads, with a focus on secure, scalable cloud solutions integrated with advanced AI capabilities.\nOpen-Weight Models & Accessibility: Open-source and open-weight AI models are narrowing the gap with proprietary systems, making high-quality AI more accessible and affordable for wider use cases.\nDiversification and Benchmark Saturation: As LLMs and foundational models saturate traditional benchmarks, attention is turning toward new domain-specific models and diverse architectures to push the next stage of progress.\nThese trends reflect a broader movement from AI as hype to AI as practical, integrated technology—delivering measurable value, automating complex workflows, and reshaping economic and social systems.`;

  const mockupAnswer = (
    <TypingParagraph text={aiTrendsText} />
  );

  return (
    <div data-testid="search-results" style={{ color: 'var(--text-light)', background: 'var(--bg)', minHeight: '100vh', padding: '48px 0' }}>
      {/* Sticky bar for research question */}
      {query.trim() === 'Research the latest trends in AI' && showStickyBar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, background: 'var(--bg)', borderBottom: '2px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 62 }}>
          <div style={{ fontWeight: 500, fontSize: '1.3rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60vw', marginLeft: 300 }}>
            Research the latest trends in AI
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isAuthenticated ? (
              <>
                <button 
                  style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', marginRight: '8px' }}
                >
                  Log in
                </button>
                <button 
                  onClick={onSignUpClick}
                  style={{ backgroundColor: 'var(--primary)', color: darkMode ? 'var(--border-dark)' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)', marginRight: '8px' }}>
                  {user?.name}
                </span>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  <img 
                    src={user?.picture} 
                    alt={user?.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span style={{ display: 'none' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Query row */}
      <div
        ref={questionRef}
        style={{ 
          position: 'relative', 
          marginTop: -20, 
          marginBottom: 38, 
          maxWidth: 1000, 
          marginLeft: 'auto', 
          marginRight: 'auto',
          display: selectedPerson ? 'none' : 'block'
        }}
      >
        {editing ? (
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Hidden div for measuring height */}
            <div
              ref={hiddenDivRef}
              style={{
                position: 'absolute',
                visibility: 'hidden',
                zIndex: -1,
                top: 0,
                left: 0,
                width: '100%',
                fontSize: '1.7rem',
                fontWeight: 500,
                color: 'var(--text)',
                fontFamily: 'inherit',
                border: 'none',
                borderRadius: 0,
                padding: 0,
                background: 'transparent',
                outline: 'none',
                marginRight: 0,
                marginLeft: 150,
                paddingRight: 120,
                boxSizing: 'border-box',
                lineHeight: 1.2,
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}
            >
              {editValue || '\u200b'}
            </div>
            <textarea
              ref={el => {
                editTextRef.current = el;
                if (followupRef) followupRef.current = el;
              }}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              style={{
                fontSize: '1.7rem',
                fontWeight: 500,
                color: 'var(--text)',
                fontFamily: 'inherit',
                border: 'none',
                borderRadius: 0,
                padding: 0,
                background: 'transparent',
                outline: 'none',
                width: '100%',
                minHeight: '2.2em',
                maxHeight: '8em',
                marginRight: 0,
                marginLeft: 150,
                paddingRight: 120,
                boxSizing: 'border-box',
                lineHeight: 1.2,
                overflow: 'auto',
                resize: 'none',
                whiteSpace: 'pre-line',
              }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditConfirm(); }
                if (e.key === 'Escape') handleEditCancel();
              }}
              rows={1}
            />
            <div style={{ position: 'absolute', top: 0, right: 140, display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={handleEditConfirm}
                style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="Confirm"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 13l5-5 5 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                onClick={handleEditCancel}
                style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="Cancel"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <h1 
                style={{ fontSize: '1.7rem', fontWeight: 500, color: 'var(--text)', margin: 0, paddingRight: 120, marginLeft: 150, whiteSpace: 'pre-line', wordBreak: 'break-word', display: 'inline-block' }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {query}
              </h1>
              {hovered && (
                <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={handleEdit}
                      style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      title="Edit Query"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM15.7 6.04a1 1 0 0 0 0-1.41l-1.3-1.3a1 1 0 0 0-1.41 0l-1.13 1.13 2.5 2.5 1.13-1.13z" fill="#fff"/></svg>
                      <span style={{
                        marginLeft: 6,
                        fontSize: '0.98rem',
                        display: 'none',
                        background: 'var(--primary)',
                        color: 'var(--primary-contrast)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        position: 'absolute',
                        left: '110%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                      className="edit-tooltip"
                      >Edit Query</span>
                    </button>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={handleCopy}
                      style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      title="Copy Query"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="7" y="7" width="9" height="9" rx="2" stroke="#fff" strokeWidth="1.5"/><rect x="4" y="4" width="9" height="9" rx="2" fill="none" stroke="#fff" strokeWidth="1.5"/></svg>
                      <span style={{
                        marginLeft: 6,
                        fontSize: '0.98rem',
                        display: 'none',
                        background: 'var(--primary)',
                        color: 'var(--primary-contrast)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        position: 'absolute',
                        left: '110%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                      className="copy-tooltip"
                      >{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <hr className="ai-divider" />
          </>
        )}
      </div>
            {query.trim() === 'Engineers who have contributed to open source projects' && (
              !showAIResponse ? (
                <div style={{
                  maxWidth: 700,
                  margin: '20px auto 24px auto',
                  padding: '0 24px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  minHeight: 60,
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: darkMode ? 'var(--card-bg)' : '#fff',
                    border: `1.5px solid #f0f0f0`,
                  display: 'flex',
                  alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="10" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                      <circle cx="14" cy="14" r="4.5" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                    </svg>
                  </div>
                  <div style={{
                    flex: 1,
                    color: 'var(--text-muted)',
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    marginTop: '12px'
                }}>
                  <span className="thinking-shimmer"><span className="shimmer-text">Finding engineers with recent open source activity{thinkingDots}</span></span>
                  </div>
                </div>
              ) : null
            )}
            {/* AI Response */}
            {query.trim() && showAIResponse && !selectedPerson && (
              <div style={{
                maxWidth: 700,
                margin: '0 auto 24px auto',
                padding: '0 24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                minHeight: 60,
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: darkMode ? 'var(--card-bg)' : '#fff',
                  border: `1.5px solid #f0f0f0`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="10" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                    <circle cx="14" cy="14" r="4.5" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                  </svg>
                </div>
                <div style={{
                  flex: 1,
                  color: 'var(--text)',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  marginTop: '4px'
                }}>
                  <TypingParagraph 
                    text={realExplanation || `Searching your network for people related to "${query}"...`} 
                    speed={25} 
                    instant={animationsCompleted} 
                  />
                </div>
              </div>
            )}

            {/* People Cards */}
            {query.trim() && showPeopleCards && !selectedPerson && (
              <PeopleCardList 
                people={searchLoading ? [
                  {
                    name: 'Searching...',
                    followers: '...',
                    platform: 'twitter',
                    username: 'loading',
                    avatarBg: 'linear-gradient(135deg, #3a8dde 0%, #b388ff 100%)',
                    scores: [
                      { label: 'Loading', color: 'yellow' }
                    ],
                    quote: 'Searching your network for relevant people...'
                  }
                ] : noStrongConnections ? [
                  {
                    name: 'No Strong Connections',
                    followers: '0',
                    platform: 'twitter',
                    username: 'no-connections',
                    avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    scores: [
                      { label: 'Expand Network', color: 'yellow' }
                    ],
                    quote: realExplanation || 'No strong connections found for this search.'
                  }
                ] : realPeople.length > 0 ? realPeople : [
                  {
                    name: 'No Results',
                    followers: '0',
                    platform: 'twitter',
                    username: 'no-results',
                    avatarBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    scores: [
                      { label: 'No matches', color: 'red' }
                    ],
                    quote: `No people found in your network matching "${query}"`
                  }
                ]}
                darkMode={darkMode}
                animationsCompleted={animationsCompleted}
                followupSent={followupSent}
                onCardClick={handleCardClick}
              />
            )}

            {/* Follow-up Query Display */}
            {followupSent && followupQuery && (
              <div 
                data-testid="followup-query"
                style={{ 
                  position: 'relative', 
                  marginTop: -550, 
                  marginBottom: 38, 
                  maxWidth: 1000, 
                  marginLeft: 'auto', 
                  marginRight: 'auto',
                  paddingTop: 0
                }}
              >
                <div style={{ position: 'relative' }}>
                  <h1 
                    style={{ fontSize: '1.7rem', fontWeight: 500, color: 'var(--text)', margin: 0, paddingRight: 120, marginLeft: 150, whiteSpace: 'pre-line', wordBreak: 'break-word', display: 'inline-block' }}
                    onMouseEnter={() => setFollowupHovered(true)}
                    onMouseLeave={() => setFollowupHovered(false)}
                  >
                    {followupQuery}
                  </h1>
                  {followupHovered && (
                    <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button
                          onClick={handleFollowupEdit}
                          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          title="Edit Query"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM15.7 6.04a1 1 0 0 0 0-1.41l-1.3-1.3a1 1 0 0 0-1.41 0l-1.13 1.13 2.5 2.5 1.13-1.13z" fill="#fff"/></svg>
                          <span style={{
                            marginLeft: 6,
                            fontSize: '0.98rem',
                            display: 'none',
                            background: 'var(--primary)',
                            color: 'var(--primary-contrast)',
                            borderRadius: 4,
                            padding: '2px 8px',
                            position: 'absolute',
                            left: '110%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                          }}
                          className="edit-tooltip"
                          >Edit Query</span>
                        </button>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button
                          onClick={handleFollowupCopy}
                          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          title="Copy Query"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="7" y="7" width="9" height="9" rx="2" stroke="#fff" strokeWidth="1.5"/><rect x="4" y="4" width="9" height="9" rx="2" fill="none" stroke="#fff" strokeWidth="1.5"/></svg>
                          <span style={{
                            marginLeft: 6,
                            fontSize: '0.98rem',
                            display: 'none',
                            background: 'var(--primary)',
                            color: 'var(--primary-contrast)',
                            borderRadius: 4,
                            padding: '2px 8px',
                            position: 'absolute',
                            left: '110%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                          }}
                          className="copy-tooltip"
                          >{followupCopied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button
                          onClick={handleClearFollowup}
                          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          title="Clear Follow-up"
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                          <span style={{
                            marginLeft: 6,
                            fontSize: '0.98rem',
                            display: 'none',
                            background: 'var(--primary)',
                            color: 'var(--primary-contrast)',
                            borderRadius: 4,
                            padding: '2px 8px',
                            position: 'absolute',
                            left: '110%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                          }}
                          className="clear-tooltip"
                          >Clear</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <hr className="ai-divider" />
              </div>
            )}

            {/* Filtered People Cards */}
            {followupSent && followupQuery && filteredPeople.length > 0 && !selectedPerson && (
              <PeopleCardList 
                people={filteredPeople}
                darkMode={darkMode}
                animationsCompleted={filteredAnimationsCompleted}
                followupSent={false} // Don't add extra padding for filtered cards
                onCardClick={(person) => handleCardClick(person, true)}
              />
            )}

            {selectedPerson && (
              <div style={{ position: 'relative', minHeight: 60 }}>
                <button onClick={() => setSelectedPerson(null)} style={{ position: 'absolute', left: 80, top: selectedPerson?.isFromFollowup ? 380 : -40, background: 'none', border: 'none', color: darkMode ? '#fff' : '#222', fontWeight: 500, fontSize: '0.98rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10, opacity: profileSlideUp ? 0 : 1, pointerEvents: profileSlideUp ? 'none' : 'auto' }}>
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M13 16l-5-6 5-6" stroke={darkMode ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back
                </button>
                
                <div style={{ 
                  maxWidth: 700, 
                  margin: selectedPerson?.isFromFollowup ? '420px auto 0 auto' : '0 auto 0 auto', 
                  color: darkMode ? '#fff' : '#232427', 
                  padding: '0 8px', 
                  paddingBottom: 200,
                  transform: profileSlideUp ? 'translateY(-100vh)' : 'translateY(0)',
                  transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  position: selectedPerson?.isFromFollowup ? 'absolute' : 'relative',
                  top: selectedPerson?.isFromFollowup ? '0' : 'auto',
                  left: selectedPerson?.isFromFollowup ? '0' : 'auto',
                  right: selectedPerson?.isFromFollowup ? '0' : 'auto',
                  zIndex: profileSlideUp ? 1 : 10,
                  height: profileSlideUp ? '0' : 'auto',
                  overflow: profileSlideUp ? 'hidden' : 'visible',
                  background: selectedPerson?.isFromFollowup ? (darkMode ? 'var(--bg)' : '#fff') : 'transparent',
                  minHeight: selectedPerson?.isFromFollowup ? '100vh' : 'auto'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: 0, 
                    marginBottom: 26,
                    opacity: profileAnimated.header ? 1 : 0,
                    transform: profileAnimated.header ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', background: selectedPerson.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', fontWeight: 700 }}>
                      <span style={{ fontSize: 26 }}>{selectedPerson.name[0]}</span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>{selectedPerson.name}</div>
                          {onToggleStarUser && (
                            <StarButton 
                              person={selectedPerson}
                              isStarred={starredUsers.some(user => user.name === selectedPerson.name)}
                              onToggle={onToggleStarUser}
                              darkMode={darkMode}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: '1rem', color: darkMode ? '#bbb' : '#666', fontWeight: 400, marginTop: 6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Senior Software Engineer</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2">
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                          </svg>
                          <span style={{ fontSize: '0.9rem', color: '#1da1f2', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>@{selectedPerson.username || selectedPerson.name?.toLowerCase().replace(/\s+/g, '_')}</span>
                        </div>
                    </div>
                  </div>
                    
                    {/* Open Chat Button */}
                    <button
                      style={{
                        position: 'absolute',
                        left: 310, // moved left from 520
                        top: 20,
                        background: 'none',
                        border: 'none',
                        color: darkMode ? '#fff' : '#222',
                        fontWeight: 500,
                        fontSize: '0.98rem',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        zIndex: 1001,
                        opacity: profileSlideUp ? 0 : 1,
                        pointerEvents: profileSlideUp ? 'none' : 'auto',
                        transition: 'opacity 0.3s ease'
                      }}
                      onClick={() => {
                        setChatOpen(true);
                        setProfileSlideUp(true);
                      }}
                      title="Chat with this user profile" // hover tooltip
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2,2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                  <div style={{ position: 'relative' }} className="connect-dropdown-container">
                      <button 
                        ref={setConnectButtonRef}
                        onClick={(e) => {
                          setShowConnectDropdown(!showConnectDropdown);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          border: '1px solid #e0e0e0',
                          borderRadius: 20,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: '#333',
                          cursor: 'pointer',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0f0f0';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Connect
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      
                      {/* Connect Dropdown */}
                      {showConnectDropdown && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 8,
                          backgroundColor: '#ffffff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 12,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          padding: '12px 16px',
                          minWidth: 200,
                          zIndex: 9999,
                          isolation: 'isolate'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2">
                              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                            </svg>
                            <span style={{ fontSize: '0.9rem', color: '#1da1f2', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                              @{selectedPerson.username || selectedPerson.name?.toLowerCase().replace(/\s+/g, '_')}
                            </span>
                            </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Pattern Tooltip */}
                    {hoveredPattern && (
                      <div style={{
                        position: 'fixed',
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: 4,
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 10000,
                        width: 300,
                        fontSize: '0.85rem',
                        color: darkMode ? '#d1d5db' : '#374151',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        lineHeight: 1.4
                      }}>
                        {hoveredPattern === 'opensource' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>Open Source Contributors → React Enthusiasts</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              Based on data from similar profiles, open source contributors often gravitate toward React ecosystem development.
                            </div>
                          </div>
                        )}
                        {hoveredPattern === 'react' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>React Devs → Performance Optimization</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              React developers frequently develop expertise in performance optimization as they scale applications.
                            </div>
                          </div>
                        )}
                        {hoveredPattern === 'community' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>Node.js Users → Community Leaders</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              Node.js developers often become community mentors due to the collaborative nature of the ecosystem.
                            </div>
                          </div>
                        )}
                        {hoveredPattern === 'performance' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>Performance Devs → System Architects</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              Performance optimization specialists often evolve into system architecture roles as they gain experience.
                            </div>
                          </div>
                        )}
                        {hoveredPattern && hoveredPattern.startsWith('reason') && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Match Analysis</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              {generatePersonalizedMatchReasons(selectedPerson)[parseInt(hoveredPattern.replace('reason', ''))]?.description || 'Based on our analysis of their profile and network connections.'}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    opacity: profileAnimated.overview ? 1 : 0,
                    transform: profileAnimated.overview ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 32, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Overview</div>
                    <div style={{ fontSize: '0.95rem', color: darkMode ? '#d1d5db' : '#555', marginBottom: 28, lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>
                    {selectedPerson.aiProfileOverview || generatePersonalizedOverview(selectedPerson)}
                  </div>
                  </div>
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                                        <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Why we think you're a good match</div>
                    <div style={{ marginBottom: 28 }}>
                      {generatePersonalizedMatchReasons(selectedPerson).map((reason, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          </div>
                          <span 
                            style={{ fontSize: '0.9rem', color: darkMode ? '#9ca3af' : '#666', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              setHoveredPattern(`reason${index}`);
                              setTooltipPosition({ x: 350, y: 300 });
                            }}
                            onMouseLeave={() => setHoveredPattern(null)}
                          >
                            {reason.text}
                          </span>
                          <svg 
                            width="14" height="14" viewBox="0 0 24 24" fill="none" 
                            style={{ marginLeft: 4, cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              setHoveredPattern(`reason${index}`);
                              setTooltipPosition({ x: 350, y: 300 });
                            }}
                            onMouseLeave={() => setHoveredPattern(null)}
                          >
                            <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                            <path d="M12 16v-4M12 8h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        </div>
                        <span 
                          style={{ fontSize: '0.9rem', color: darkMode ? '#9ca3af' : '#666', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('performance');
                            setTooltipPosition({ x: 350, y: 300 });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          Performance Optimization Specialist
                        </span>
                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" 
                          style={{ marginLeft: 4, cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('performance');
                            setTooltipPosition({ x: 350, y: 300 });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                          <path d="M12 16v-4M12 8h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>What can you say to them</div>
                    <div style={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#f8fafc', 
                      border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`, 
                      borderRadius: 12, 
                      padding: '16px', 
                      marginBottom: 28 
                    }}>
                      <div style={{ fontSize: '0.9rem', color: darkMode ? '#9ca3af' : '#64748b', marginBottom: 8, fontWeight: 500 }}>Based on similar conversations:</div>
                      <div style={{ fontSize: '0.95rem', color: darkMode ? '#d1d5db' : '#334155', lineHeight: 1.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>
                        "{selectedPerson.aiConnectionMessage || `Hi ${selectedPerson.name}! I was impressed by your professional presence and would love to connect and discuss potential collaboration opportunities.`}"
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Timeline</div>
                                         <div style={{ marginBottom: 24 }}>
                       {/* Timeline Items - Dynamic AI-generated content */}
                       {selectedPerson.aiTimelineContent && selectedPerson.aiTimelineContent.length > 0 ? (
                         selectedPerson.aiTimelineContent.slice(0, 3).map((timelineItem, index) => (
                           <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                             <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                               {timelineItem.type === 'tweet' && (
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" fill="none"/>
                                 </svg>
                               )}
                               {timelineItem.type === 'retweet' && (
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M23 4v6.67A4 4 0 0 1 17.67 15H15M1 20v-6.67A4 4 0 0 1 6.33 9H9" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                 </svg>
                               )}
                               {timelineItem.type === 'like' && (
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" fill="none"/>
                                 </svg>
                               )}
                             </div>
                             <div style={{ flex: 1 }}>
                               <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>{timelineItem.action}</div>
                               <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"{timelineItem.content}"</div>
                               <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>{timelineItem.time}</div>
                             </div>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                               <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                             </svg>
                           </div>
                         ))
                       ) : (
                         // Fallback timeline items if no AI content
                         <>
                           {/* Timeline Item 1 - Tweet */}
                           <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                             <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" fill="none"/>
                               </svg>
                             </div>
                             <div style={{ flex: 1 }}>
                               <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>{selectedPerson.name} tweeted</div>
                               <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"Working on exciting {selectedPerson.aiExpertiseAreas ? selectedPerson.aiExpertiseAreas[0] : 'technology'} projects!"</div>
                               <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>2 days ago</div>
                             </div>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                               <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                             </svg>
                           </div>
                           
                           {/* Timeline Item 2 - Retweet */}
                           <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                             <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M23 4v6.67A4 4 0 0 1 17.67 15H15M1 20v-6.67A4 4 0 0 1 6.33 9H9" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                               </svg>
                             </div>
                             <div style={{ flex: 1 }}>
                               <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>{selectedPerson.name} retweeted @industry_expert</div>
                               <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"Fascinating developments in {selectedPerson.aiExpertiseAreas ? selectedPerson.aiExpertiseAreas[1] : 'the field'}."</div>
                               <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>3 days ago</div>
                             </div>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                               <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                             </svg>
                           </div>
                           
                           {/* Timeline Item 3 - Like */}
                           <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                             <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" fill="none"/>
                               </svg>
                             </div>
                             <div style={{ flex: 1 }}>
                               <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>{selectedPerson.name} liked @thought_leader</div>
                               <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"Valuable insights on {selectedPerson.aiExpertiseAreas ? selectedPerson.aiExpertiseAreas[2] : 'professional growth'}."</div>
                               <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>1 week ago</div>
                             </div>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                               <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                             </svg>
                           </div>
                         </>
                       )}
                      
                      {/* Show more button */}
                      <div 
                        style={{ 
                        border: '1px solid #8b5cf6', 
                        borderRadius: 8, 
                        padding: '8px 12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => setShowMoreTimeline(!showMoreTimeline)}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff" style={{ transform: showMoreTimeline ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <path d="M7 14l5-5 5 5"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 500 }}>
                          {showMoreTimeline ? 'Show less' : '2 more interactions'}
                        </span>
                      </div>

                      {/* Additional timeline items */}
                      {showMoreTimeline && (
                        <>
                          {/* Timeline Item 4 - Comment */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, marginTop: 16 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>Vinoth commented on @ReactTeam</div>
                              <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"This is exactly what the React ecosystem needed. The performance improvements are game-changing for large applications. Great work team! 🎉"</div>
                              <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>1 week ago</div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                              <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                            </svg>
                          </div>

                          {/* Timeline Item 5 - Share */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>Vinoth shared @NodeJS</div>
                              <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"Important security update for all Node.js users. Make sure to upgrade to 20.10.0 to patch the vulnerabilities."</div>
                              <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>2 weeks ago</div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                              <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Predicted Interests</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                      {selectedPerson.aiPredictedInterests && selectedPerson.aiPredictedInterests.length > 0 ? (
                        selectedPerson.aiPredictedInterests.map((interest, index) => (
                          <div key={index} style={{ 
                            backgroundColor: 'transparent', 
                            color: darkMode ? '#d1d5db' : '#374151',
                            padding: '6px 12px', 
                            borderRadius: 16, 
                            fontSize: '0.85rem', 
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {interest}
                          </div>
                        ))
                      ) : (
                        // Fallback interests if no AI content
                        <>
                          <div style={{ 
                            backgroundColor: 'transparent', 
                            color: darkMode ? '#d1d5db' : '#374151',
                            padding: '6px 12px', 
                            borderRadius: 16, 
                            fontSize: '0.85rem', 
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {selectedPerson.aiExpertiseAreas ? selectedPerson.aiExpertiseAreas[0] : 'Technology'}
                          </div>
                          <div style={{ 
                            backgroundColor: 'transparent', 
                            color: darkMode ? '#d1d5db' : '#374151',
                            padding: '6px 12px', 
                            borderRadius: 16, 
                            fontSize: '0.85rem', 
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {selectedPerson.aiExpertiseAreas ? selectedPerson.aiExpertiseAreas[1] : 'Development'}
                          </div>
                          <div style={{ 
                            backgroundColor: 'transparent', 
                            color: darkMode ? '#d1d5db' : '#374151',
                            padding: '6px 12px', 
                            borderRadius: 16, 
                            fontSize: '0.85rem', 
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {selectedPerson.aiExpertiseAreas ? selectedPerson.aiExpertiseAreas[2] : 'Innovation'}
                          </div>
                        </>
                      )}

                    </div>
                </div>

      </div>
              </div>
            )}
            
            {/* Back Button - always visible when chat is open OR when a message is sent */}
            {(profileSlideUp && selectedPerson && (chatOpen || followupSent)) && (
              <div style={{
                position: 'fixed',
                top: 60,
                left: '30%', // moved right from 20%
                zIndex: 1000,
                maxWidth: 300,
                width: 'auto',
                padding: '0 20px'
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: darkMode ? '#fff' : '#222',
                    fontWeight: 500,
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    zIndex: 10
                  }}
                  onClick={() => {
                    setChatOpen(false);
                    setProfileSlideUp(false);
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M13 16l-5-6 5-6" stroke={darkMode ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back
                </button>
              </div>
            )}

            {/* Chat Bubble - only shows when there's a sent message */}
            {(profileSlideUp && selectedPerson && followupSent && sentMessage) && (
              <div style={{
                position: 'fixed',
                top: 100,
                left: '75%', // moved right from 70%
                zIndex: 1000,
                maxWidth: 400,
                width: 'auto',
                padding: '0 20px'
              }}>
                <div style={{
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  color: darkMode ? '#d1d5db' : '#374151',
                  padding: '12px 16px',
                  borderRadius: '20px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                  display: 'inline-block',
                  maxWidth: 'fit-content',
                  wordWrap: 'break-word'
                }}>
                  {sentMessage}
                </div>
              </div>
            )}
            
            {/* Placeholder for no chats - responsive positioning */}
            {(profileSlideUp && selectedPerson && chatOpen && !followupSent) && (
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '60%', // moved left from 70%
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: '1.08rem',
                textAlign: 'center',
                fontWeight: 500,
                maxWidth: '300px',
                wordWrap: 'break-word'
              }}>
                Chats with user profile will go here
              </div>
            )}
            
      {/* Follow-up input fixed at the bottom, overlaying the answer text */}
      <div 
        className={
          !isSidebarCollapsed ? 'followup-bar-sidebar-expanded' : ''
        }
        style={{ position: 'fixed', left: 80, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 100 }}
      >
        <div className="input-box" style={{ minWidth: 300, maxWidth: 700, width: '100%', margin: 0, padding: 0, boxShadow: '0 2px 8px var(--input-box-shadow)', border: '1.5px solid var(--input-border)', borderRadius: 14, background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: 0, minHeight: 38 }}>
          <textarea
            ref={followupRef}
            className="search-input"
            placeholder="Ask a follow-up..."
            value={followupValue}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              width: '100%',
              minWidth: '300px',
              background: 'transparent',
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              padding: '10px 14px 10px 14px',
              borderRadius: 14,
              minHeight: 38,
              boxSizing: 'border-box',
              color: '#222',
            }}
            onInput={handleFollowupInput}
            onKeyDown={handleFollowupKeyDown}
            rows="1"
          />
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 0, paddingTop: 4, marginBottom: 10 }}>
            <NetworkDot enabled={networkOnly} onToggle={setNetworkOnly} darkMode={darkMode} />
            <div style={{ flex: 1 }} />
            <button 
              className={`input-action-btn ${followupValue.trim() ? 'input-action-btn-active' : ''}`} 
              title="Go"
              disabled={!followupValue.trim()}
              onClick={handleFollowupSubmit}
              style={{
                backgroundColor: followupValue.trim() ? '#232427' : '#232427',
                borderColor: followupValue.trim() ? '#232427' : '#232427',
                color: '#fafaf8',
                transition: 'all 0.2s ease',
                cursor: followupValue.trim() ? 'pointer' : 'default',
                marginRight: 8,
                marginTop: -8
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M5 13l5-5 5 5" 
                  stroke={'#fafaf8'} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Answer text (no card, no background) */}
      {query.trim() === 'Research the latest trends in AI' && (
        <div style={{ marginTop: 0, paddingBottom: 200 }}>
          {mockupAnswer}
          {/* Share button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 700, margin: '32px auto 0 auto', padding: '0 24px' }}>
            <button
              className="share-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '5px 12px', fontWeight: 500, fontSize: '0.95rem', color: '#222', cursor: 'pointer', boxShadow: 'none', transition: 'background 0.18s' }}
              onClick={handleShare}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ marginRight: 3 }}><path d="M15 8.5V6.5C15 4.567 13.433 3 11.5 3C9.567 3 8 4.567 8 6.5V8.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/><path d="M11.5 13.5V6.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 10.5V13.5C5 15.433 6.567 17 8.5 17C10.433 17 12 15.433 12 13.5V10.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {shareCopied ? 'Copied!' : 'Share'}
            </button>
          </div>
          {/* Related section */}
          <div className="related-section" style={{ maxWidth: 700, margin: '48px auto 0 auto', padding: '0 24px' }}>
            <div style={{ fontWeight: 600, fontSize: '1.18rem', color: '#222', marginBottom: 18 }}>Similar Questions</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('How is agentic AI changing the workplace?')}>
                How is agentic AI changing the workplace?
              </li>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('What are the top open-source AI models in 2024?')}>
                What are the top open-source AI models in 2024?
              </li>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('AI trends in healthcare and medicine')}>
                AI trends in healthcare and medicine
              </li>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('What is multimodal AI and why does it matter?')}>
                What is multimodal AI and why does it matter?
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showSignIn, setShowSignIn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Add chat history state
  const [starredUsers, setStarredUsers] = useState([]); // Add starred users state

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleOpenMira = () => {
    setShowLoadingScreen(false);
  };

  const toggleDarkMode = () => setDarkMode((d) => !d);

  // Handler to toggle starred users
  const handleToggleStarUser = (person) => {
    setStarredUsers(prev => {
      const isAlreadyStarred = prev.some(user => user.name === person.name);
      if (isAlreadyStarred) {
        return prev.filter(user => user.name !== person.name);
      } else {
        return [...prev, { name: person.name, id: person.id || person.name }];
      }
    });
  };

  // Handler to add a chat/search to history
  const handleAddChat = useCallback((query) => {
    console.log("Adding chat to history:", query);
    setChatHistory((prev) => {
      if (!query.trim() || prev.includes(query)) {
        console.log("Query already exists or is empty, skipping");
        return prev;
      }
      const newHistory = [query, ...prev].slice(0, 20); // keep max 20
      console.log("New chat history:", newHistory);
      
      // Save to localStorage if user is authenticated
      const savedUser = localStorage.getItem('mira_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          localStorage.setItem(`mira_chat_history_${userData.id}`, JSON.stringify(newHistory));
          console.log("Saved chat history to localStorage for user:", userData.id);
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
      } else {
        console.log("No authenticated user found, not saving to localStorage");
      }
      
      return newHistory;
    });
  }, []);

  // Handler to delete a chat by index
  const handleDeleteChat = useCallback((idx) => {
    console.log("Deleting chat at index:", idx);
    setChatHistory((prev) => {
      const newHistory = prev.filter((_, i) => i !== idx);
      console.log("Updated chat history after deletion:", newHistory);
      
      // Save to localStorage if user is authenticated
      const savedUser = localStorage.getItem('mira_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          localStorage.setItem(`mira_chat_history_${userData.id}`, JSON.stringify(newHistory));
          console.log("Saved updated chat history to localStorage for user:", userData.id);
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
      } else {
        console.log("No authenticated user found, not saving to localStorage");
      }
      
      return newHistory;
    });
  }, []);

  // Function to clear chat history (called on logout)
  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  // Function to restore chat history for a specific user
  const restoreChatHistory = useCallback((userId) => {
    console.log("Attempting to restore chat history for user:", userId);
    const savedChatHistory = localStorage.getItem(`mira_chat_history_${userId}`);
    console.log("Found saved chat history:", savedChatHistory);
    
    if (savedChatHistory) {
      try {
        const chatHistory = JSON.parse(savedChatHistory);
        setChatHistory(chatHistory);
        console.log("Successfully restored chat history for user:", userId, chatHistory);
      } catch (error) {
        console.error("Error parsing saved chat history:", error);
        setChatHistory([]);
      }
    } else {
      console.log("No saved chat history found for user:", userId);
      setChatHistory([]);
    }
  }, []);

  if (showLoadingScreen) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LoadingScreen onOpenMira={handleOpenMira} />} />
          <Route path="/app/*" element={<AppWithRouter
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            showSignIn={showSignIn}
            setShowSignIn={setShowSignIn}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            chatHistory={chatHistory}
            onAddChat={handleAddChat}
            onDeleteChat={handleDeleteChat}
            setChatHistory={setChatHistory}
            clearChatHistory={clearChatHistory}
            restoreChatHistory={restoreChatHistory}
            starredUsers={starredUsers}
            onToggleStarUser={handleToggleStarUser}
          />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="*" element={<AppWithRouter
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          showSignIn={showSignIn}
          setShowSignIn={setShowSignIn}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          chatHistory={chatHistory}
          onAddChat={handleAddChat}
          onDeleteChat={handleDeleteChat}
          setChatHistory={setChatHistory}
          clearChatHistory={clearChatHistory}
          restoreChatHistory={restoreChatHistory}
          starredUsers={starredUsers}
          onToggleStarUser={handleToggleStarUser}
        />} />
      </Routes>
    </Router>
  );
}

// AppWithRouter is a wrapper to get useNavigate and pass it up
function AppWithRouter({ isSidebarCollapsed, onToggleSidebar, showSignIn, setShowSignIn, darkMode, toggleDarkMode, chatHistory, onAddChat, onDeleteChat, setChatHistory, clearChatHistory, restoreChatHistory, starredUsers, onToggleStarUser }) {
  const navigate = useNavigate();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectedServices, setConnectedServices] = useState([]);

  const handleNavigateChat = (query) => {
    // Trigger save of current follow-up state before navigating
    if (window.saveFollowupState) {
      window.saveFollowupState();
    }
    
    if (!query || !query.trim()) {
      navigate("/");
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Google Authentication - Redirect Flow
  useEffect(() => {
    // Check for Google OAuth response on page load
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    console.log("OAuth useEffect triggered:", { code: !!code, state: !!state, currentUrl: window.location.href });
    
    if (code && state) {
      // Handle the OAuth response
      handleGoogleOAuthResponse(code, state);
    }
  }, []);

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('mira_user');
    const savedAuth = localStorage.getItem('mira_authenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log("Restored authentication state from localStorage:", userData);
        
        // Load user-specific data
        restoreChatHistory(userData.id);
        setConnectedServices([]);
        
        const savedConnections = localStorage.getItem(`mira_connections_${userData.id}`);
        
        if (savedConnections) {
          try {
            const connections = JSON.parse(savedConnections);
            setConnectedServices(connections);
            console.log("Loaded user connections:", connections);
          } catch (error) {
            console.error("Error parsing saved connections:", error);
          }
        } else if (userData.provider === 'demo') {
          // Auto-connect demo user if no saved connections
          const demoConnections = ['Twitter', 'LinkedIn'];
          setConnectedServices(demoConnections);
          localStorage.setItem(`mira_connections_${userData.id}`, JSON.stringify(demoConnections));
          console.log("Auto-connected demo user to:", demoConnections);
        }
        
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        // Clear invalid data
        localStorage.removeItem('mira_user');
        localStorage.removeItem('mira_authenticated');
        clearChatHistory();
        setConnectedServices([]);
      }
    } else {
      // No authenticated user, clear all data
      clearChatHistory();
      setConnectedServices([]);
    }
  }, [clearChatHistory, restoreChatHistory]);

  // Debug function to check localStorage (can be called from console)
  window.debugChatHistory = () => {
    const savedUser = localStorage.getItem('mira_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const savedChatHistory = localStorage.getItem(`mira_chat_history_${userData.id}`);
      console.log("Current user:", userData);
      console.log("Saved chat history:", savedChatHistory);
      if (savedChatHistory) {
        console.log("Parsed chat history:", JSON.parse(savedChatHistory));
      }
    } else {
      console.log("No authenticated user found");
    }
  };

  // Test function to add demo chat history (can be called from console)
  window.addDemoChats = () => {
    const demoChats = [
      "Engineers who have contributed to open source projects",
      "Find developers with React experience",
      "Search for Python developers in San Francisco",
      "Find designers who work with Figma"
    ];
    
    const savedUser = localStorage.getItem('mira_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      localStorage.setItem(`mira_chat_history_${userData.id}`, JSON.stringify(demoChats));
      console.log("Added demo chats for user:", userData.id, demoChats);
      
      // If user is currently logged in, update the state
      if (userData.id === "demo_user") {
        setChatHistory(demoChats);
        console.log("Updated current chat history state");
      }
    } else {
      console.log("No authenticated user found");
    }
  };

  const handleGoogleOAuthResponse = async (code, state) => {
    console.log("Received Google OAuth response:", { code, state });
    
    // Parse the state to get modal type and saved page state
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      const { modalType } = stateData;
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com',
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET', // Use environment variable
          redirect_uri: window.location.origin,
          grant_type: 'authorization_code',
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Fetch user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const googleUserData = await userResponse.json();
      
      // Transform Google user data to our format
      const userData = {
        id: `google_${googleUserData.id}`,
        email: googleUserData.email,
        name: googleUserData.name,
        given_name: googleUserData.given_name,
        family_name: googleUserData.family_name,
        picture: googleUserData.picture,
        provider: 'google',
        access_token: accessToken
      };
      
      // Set user data and authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist authentication state to localStorage
      localStorage.setItem('mira_user', JSON.stringify(userData));
      localStorage.setItem('mira_authenticated', 'true');
      
      // Clear current chat history and load user-specific data
      clearChatHistory();
      setConnectedServices([]);
      
      // Load user-specific data
      restoreChatHistory(userData.id);
      
      const savedConnections = localStorage.getItem(`mira_connections_${userData.id}`);
      
      if (savedConnections) {
        try {
          const connections = JSON.parse(savedConnections);
          setConnectedServices(connections);
          console.log("Loaded user connections:", connections);
        } catch (error) {
          console.error("Error parsing saved connections:", error);
        }
      }
      
      // Close the appropriate modal
      if (modalType === 'signup') {
        setShowSignUpModal(false);
        setSignUpEmail("");
      } else if (modalType === 'login') {
        setShowLoginModal(false);
        setLoginEmail("");
      }
      
      console.log("Authentication successful for:", modalType);
      console.log("User data:", userData);
      
      // Always redirect to homepage after authentication
      setTimeout(() => {
        console.log("Redirecting to homepage after authentication");
        navigate('/');
        // Clean up OAuth params from URL
        window.history.replaceState({}, document.title, '/');
      }, 100);
      
    } catch (error) {
      console.error("Error in OAuth flow:", error);
      
      // Fallback to mock data for development
      const mockUserData = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        email: 'morgant11@montclair.edu',
        name: 'Morgan T',
        given_name: 'Morgan',
        family_name: 'T',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google'
      };
      
      setUser(mockUserData);
      setIsAuthenticated(true);
      localStorage.setItem('mira_user', JSON.stringify(mockUserData));
      localStorage.setItem('mira_authenticated', 'true');
      
      // Clear current chat history and load user-specific data
      clearChatHistory();
      setConnectedServices([]);
      
      // Load user-specific data
      restoreChatHistory(mockUserData.id);
      
      const savedConnections = localStorage.getItem(`mira_connections_${mockUserData.id}`);
      
      if (savedConnections) {
        try {
          const connections = JSON.parse(savedConnections);
          setConnectedServices(connections);
          console.log("Loaded user connections:", connections);
        } catch (error) {
          console.error("Error parsing saved connections:", error);
        }
      }
      
      // Always redirect to homepage after authentication
      setTimeout(() => {
        navigate('/');
        window.history.replaceState({}, document.title, '/');
      }, 100);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Redirecting to Google Sign Up...");
    
    // Save current page state to restore after authentication
    const currentState = {
      modalType: 'signup',
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
      timestamp: Date.now()
    };
    
    // Create state parameter with current page info
    const state = encodeURIComponent(JSON.stringify(currentState));
    
    // Use base domain as redirect URI (Google OAuth requirement)
    const redirectUri = window.location.origin;
    console.log("Redirect URI:", redirectUri);
    
    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || '302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com'}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log("Full Google Auth URL:", googleAuthUrl);
    
    // Redirect current page to Google Auth
    window.location.href = googleAuthUrl;
  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google Login...");
    
    // Save current page state to restore after authentication
    const currentState = {
      modalType: 'login',
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
      timestamp: Date.now()
    };
    
    // Create state parameter with current page info
    const state = encodeURIComponent(JSON.stringify(currentState));
    
    // Use base domain as redirect URI (Google OAuth requirement)
    const redirectUri = window.location.origin;
    
    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || '302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com'}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // Redirect current page to Google Auth
    window.location.href = googleAuthUrl;
  };

  const handleLogout = () => {
    // Clear user-specific data from localStorage (but keep chat history)
    if (user) {
      localStorage.removeItem(`mira_connections_${user.id}`);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    // Clear localStorage
    localStorage.removeItem('mira_user');
    localStorage.removeItem('mira_authenticated');
    // Clear chat history state when logging out (but keep in localStorage)
    clearChatHistory();
    console.log("User logged out");
  };

  const handleDemoLogin = () => {
    setEmailError("");
    setPasswordError("");
    
    if (loginEmail === "demo@mira.com") {
      // Show password modal
      setShowLoginModal(false);
      setShowPasswordModal(true);
    } else {
      // Show error for invalid email
      setEmailError("Please sign up or use demo@mira.com");
      // Add shake animation by temporarily adding a class
      const emailInput = document.getElementById('login-email-input');
      if (emailInput) {
        emailInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          emailInput.style.animation = '';
        }, 500);
      }
    }
  };

  const handleDemoPassword = () => {
    setPasswordError("");
    
    if (loginPassword === "demo") {
      // Create demo user data
      const demoUserData = {
        id: "demo_user",
        email: "demo@mira.com",
        name: "Demo User",
        given_name: "Demo",
        family_name: "User",
        picture: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff&size=40",
        provider: 'demo'
      };
      
      // Set user data and authentication state
      setUser(demoUserData);
      setIsAuthenticated(true);
      
      // Persist authentication state to localStorage
      localStorage.setItem('mira_user', JSON.stringify(demoUserData));
      localStorage.setItem('mira_authenticated', 'true');
      
      // Load user-specific data
      console.log("Demo login: About to restore chat history for:", demoUserData.id);
      restoreChatHistory(demoUserData.id);
      setConnectedServices([]);
      
      // Auto-connect Twitter and LinkedIn for demo user
      const demoConnections = ['Twitter', 'LinkedIn'];
      setConnectedServices(demoConnections);
      localStorage.setItem(`mira_connections_${demoUserData.id}`, JSON.stringify(demoConnections));
      console.log("Auto-connected demo user to:", demoConnections);
      
      // Close modals
      setShowPasswordModal(false);
      setLoginEmail("");
      setLoginPassword("");
      
      console.log("Demo user logged in:", demoUserData);
    } else {
      // Show error for invalid password
      setPasswordError("Incorrect password. Use 'demo'");
      // Add shake animation
      const passwordInput = document.getElementById('login-password-input');
      if (passwordInput) {
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          passwordInput.style.animation = '';
        }, 500);
      }
    }
  };

  const handleConnectionUpdate = (service, connected) => {
    setConnectedServices(prev => {
      let newConnections;
      if (connected) {
        newConnections = prev.includes(service) ? prev : [...prev, service];
      } else {
        newConnections = prev.filter(s => s !== service);
      }
      
      // Save to localStorage if user is authenticated
      if (user && isAuthenticated) {
        localStorage.setItem(`mira_connections_${user.id}`, JSON.stringify(newConnections));
      }
      
      return newConnections;
    });
  };



  return (
    <div className="app-container">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        chatHistory={chatHistory}
        onNavigateChat={handleNavigateChat}
        onDeleteChat={onDeleteChat}
        darkMode={darkMode}
        connectedServices={connectedServices}
        starredUsers={starredUsers}
        onToggleStarUser={onToggleStarUser}
      />
      <div className={`main-area ${isSidebarCollapsed ? 'main-area-expanded' : ''}`}>
        <TopBar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          onSignUpClick={() => setShowSignUpModal(true)} 
          onLoginClick={() => setShowLoginModal(true)}
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<MainContent darkMode={darkMode} />} />
                                      <Route path="/search" element={<SearchResultsWithHistory onAddChat={onAddChat} darkMode={darkMode} isSidebarCollapsed={isSidebarCollapsed} onSignUpClick={() => setShowSignUpModal(true)} user={user} isAuthenticated={isAuthenticated} starredUsers={starredUsers} onToggleStarUser={onToggleStarUser} />} />
          <Route path="/connections" element={<ConnectionsPage isSidebarCollapsed={isSidebarCollapsed} onConnectionUpdate={handleConnectionUpdate} user={user} isAuthenticated={isAuthenticated} />} />
        </Routes>
      </div>
      {showSignIn && <SignInPanel onClose={() => setShowSignIn(false)} />}
      
      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => { setShowSignUpModal(false); setSignUpEmail(""); }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            <div style={{ marginTop: '8px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '600', color: '#222', textAlign: 'center' }}>
                Sign Up to Mira
              </h2>
              {/* Email Input Field */}
              <input
                type="email"
                placeholder="Enter your email"
                value={signUpEmail}
                onChange={e => setSignUpEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {/* Continue with email button */}
              <button
                disabled={!isValidEmail(signUpEmail)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: isValidEmail(signUpEmail) ? '#111' : '#f0f0f0',
                  color: isValidEmail(signUpEmail) ? '#fff' : '#555',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isValidEmail(signUpEmail) ? 'pointer' : 'not-allowed',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
              >
                Continue with email
              </button>
              {/* Or separator */}
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>or</span>
              </div>
              {/* Sign up with Google button */}
              <button
                onClick={handleGoogleSignUp}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f8f8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => { setShowLoginModal(false); setLoginEmail(""); }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            <div style={{ marginTop: '8px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '600', color: '#222', textAlign: 'center' }}>
                Log in to Mira
              </h2>
              {/* Email Input Field */}
              <input
                id="login-email-input"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && isValidEmail(loginEmail) && handleDemoLogin()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: emailError ? '1px solid #ff4444' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  marginBottom: emailError ? '8px' : '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {/* Error message */}
              {emailError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  {emailError}
                </div>
              )}
              {/* Continue with email button */}
              <button
                onClick={handleDemoLogin}
                disabled={!isValidEmail(loginEmail)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: isValidEmail(loginEmail) ? '#111' : '#f0f0f0',
                  color: isValidEmail(loginEmail) ? '#fff' : '#555',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isValidEmail(loginEmail) ? 'pointer' : 'not-allowed',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
              >
                Continue with email
              </button>
              {/* Or separator */}
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>or</span>
              </div>
              {/* Log in with Google button */}
              <button
                onClick={handleGoogleLogin}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f8f8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Log in with Google
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => { 
                setShowPasswordModal(false); 
                setLoginPassword(""); 
                setPasswordError("");
                setShowLoginModal(true);
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            <div style={{ marginTop: '8px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '600', color: '#222', textAlign: 'center' }}>
                Enter your password
              </h2>
              <p style={{ 
                margin: '0 0 16px 0', 
                fontSize: '0.875rem', 
                color: '#888', 
                textAlign: 'center', 
                fontStyle: 'italic',
                animation: 'passwordHint 2s ease-in-out infinite',
                opacity: 0.7,
                transition: 'color 0.3s ease'
              }}>
                Password: demo
              </p>
              {/* Password Input Field */}
              <input
                id="login-password-input"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDemoPassword()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: passwordError ? '1px solid #ff4444' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  marginBottom: passwordError ? '8px' : '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {/* Error message */}
              {passwordError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  {passwordError}
                </div>
              )}
              {/* Continue button */}
              <button
                onClick={handleDemoPassword}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap SearchResults to add to chat history
function SearchResultsWithHistory({ onAddChat, darkMode, isSidebarCollapsed, onSignUpClick, user, isAuthenticated, starredUsers = [], onToggleStarUser }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  useEffect(() => {
    if (query) onAddChat(query);
  }, [query, onAddChat]);
  return <SearchResults darkMode={darkMode} isSidebarCollapsed={isSidebarCollapsed} onSignUpClick={onSignUpClick} user={user} isAuthenticated={isAuthenticated} starredUsers={starredUsers} onToggleStarUser={onToggleStarUser} />;
}

function AccuracyDot({ score, person, darkMode, isActive, onHover, onLeave }) {
  const getTooltipContent = () => {
    // Handle dynamic keywords with smart tooltips
    const label = score.label.toLowerCase();
    
    // AI/ML related keywords
    if (label.includes('ai') || label.includes('artificial intelligence')) {
      return {
        question: 'Does this person work with AI?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong AI background with relevant experience' : 
                score.color === 'yellow' ? 'Some AI knowledge, mixed background' : 
                'Limited AI experience found'
      };
    }
    
    if (label.includes('machine learning') || label.includes('ml')) {
      return {
        question: 'Does this person work with machine learning?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong machine learning expertise' : 
                score.color === 'yellow' ? 'Some ML knowledge, occasional mentions' : 
                'Limited machine learning experience'
      };
    }
    
    if (label.includes('algorithm')) {
      return {
        question: 'Does this person work with algorithms?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong algorithmic background' : 
                score.color === 'yellow' ? 'Some algorithm knowledge' : 
                'Limited algorithmic experience'
      };
    }
    
    // Tech/Engineering related keywords
    if (label.includes('engineering') || label.includes('technology') || label.includes('tech')) {
      return {
        question: 'Is this person in engineering/tech?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong engineering/tech background' : 
                score.color === 'yellow' ? 'Some tech experience, mixed background' : 
                'Limited engineering/tech experience'
      };
    }
    
    if (label.includes('building') || label.includes('development')) {
      return {
        question: 'Does this person build/develop things?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Active builder/developer with projects' : 
                score.color === 'yellow' ? 'Some building/development activity' : 
                'Limited building/development experience'
      };
    }
    
    // Business related keywords
    if (label.includes('business') || label.includes('leadership') || label.includes('strategy')) {
      return {
        question: 'Does this person have business/leadership experience?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong business/leadership background' : 
                score.color === 'yellow' ? 'Some business experience' : 
                'Limited business/leadership experience'
      };
    }
    
    // Research/Science related keywords
    if (label.includes('research') || label.includes('science') || label.includes('academic')) {
      return {
        question: 'Does this person do research/science?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong research/scientific background' : 
                score.color === 'yellow' ? 'Some research/science experience' : 
                'Limited research/scientific experience'
      };
    }
    
    // Design/Creative related keywords
    if (label.includes('design') || label.includes('creative') || label.includes('visual')) {
      return {
        question: 'Does this person work in design/creative?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Strong design/creative background' : 
                score.color === 'yellow' ? 'Some design/creative experience' : 
                'Limited design/creative experience'
      };
    }
    
    // Network/Activity related keywords
    if (label.includes('network') || label.includes('connection') || label.includes('activity')) {
      return {
        question: 'Is this person active in their network?',
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? 'Very active network participant' : 
                score.color === 'yellow' ? 'Some network activity' : 
                'Limited network activity'
      };
    }
    
    // Dynamic expertise areas (expertise1, expertise2, expertise3)
    if (label.includes('expertise')) {
      const expertiseIndex = label.replace('expertise', '');
      const expertiseAreas = person.aiExpertiseAreas || ['Technology', 'Social Media', 'Professional Development'];
      const expertiseArea = expertiseAreas[parseInt(expertiseIndex) - 1] || 'Professional Development';
      
      return {
        question: `Does this person have expertise in ${expertiseArea}?`,
        answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
        details: score.color === 'green' ? `Strong background in ${expertiseArea}` : 
                score.color === 'yellow' ? `Some experience in ${expertiseArea}` : 
                `Limited experience in ${expertiseArea}`
      };
    }
    
    // Default fallback for any other keywords
    return {
      question: `Does this person have ${score.label} experience?`,
      answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'No',
      details: score.color === 'green' ? `Strong ${score.label} background` : 
              score.color === 'yellow' ? `Some ${score.label} experience` : 
              `Limited ${score.label} experience`
    };
  };

  const tooltipContent = getTooltipContent();
  
  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.8rem',
        color: darkMode ? '#ccc' : '#666',
        cursor: 'pointer',
        borderRadius: 4,
        padding: '2px 4px',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div 
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: score.color === 'green' ? '#22c55e' : 
                          score.color === 'yellow' ? '#eab308' : '#ef4444'
        }}
      />
      <span>{score.label}</span>
      
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          padding: '12px 16px',
          minWidth: 280,
          maxWidth: 320,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '0.9rem',
          lineHeight: 1.4
        }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#666', fontWeight: 500 }}>
              {tooltipContent.question}
            </span>
            <span style={{ 
              color: score.color === 'green' ? '#22c55e' : 
                    score.color === 'yellow' ? '#eab308' : '#ef4444',
              fontWeight: 600,
              marginLeft: 6
            }}>
              {tooltipContent.answer}
            </span>
          </div>
          
          <div style={{ 
            color: '#888', 
            fontSize: '0.85rem',
            borderTop: '1px solid #f0f0f0',
            paddingTop: 8,
            marginTop: 8
          }}>
            {tooltipContent.details}
          </div>
          
          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #fff'
          }} />
        </div>
      )}
    </div>
  );
}

// Star Button Component
function StarButton({ person, isStarred, onToggle, darkMode }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(person);
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => e.target.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
      onMouseLeave={(e) => e.target.style.background = 'none'}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill={isStarred ? '#555' : 'none'}
        stroke={darkMode ? '#bbb' : '#666'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
      </svg>
    </button>
  );
}

function PeopleCard({ person, index, visible, darkMode, totalCards }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [activeTooltip, setActiveTooltip] = React.useState(null);
  
  // Calculate delay based on total cards for better pacing
  const baseDelay = totalCards <= 2 ? 0.3 : totalCards <= 4 ? 0.25 : 0.2;
  const animationDelay = index * baseDelay;
  
  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: 12,
        padding: '20px 24px',
        color: darkMode ? '#fff' : '#232427',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
        minHeight: 120,
        border: darkMode ? '1.2px solid #444' : '1.2px solid #e5e5e5',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-40px)',
        transition: `background 0.18s, opacity 1s cubic-bezier(.4,0,.2,1) ${animationDelay}s, transform 1s cubic-bezier(.4,0,.2,1) ${animationDelay}s`,
        margin: 0,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div style={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        background: person.avatarBg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: 32, 
        color: '#fff', 
        fontWeight: 700,
        flexShrink: 0
      }}>
        {person.avatarIcon ? person.avatarIcon : <span style={{ fontSize: 32 }}>{person.name[0]}</span>}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: '1.25rem', 
          color: darkMode ? '#fff' : '#555', 
          marginBottom: 8, 
          lineHeight: 1.2,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {person.name}
        </div>
        
        {/* Followers */}
        <div style={{ 
          color: darkMode ? '#bbb' : '#666', 
          fontSize: '0.85rem', 
          marginBottom: 10,
          fontWeight: 500,
          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {person.followers} followers
        </div>
        
        {/* Social Platform */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 12 
        }}>
          {person.platform === 'twitter' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span style={{ 
                color: darkMode ? '#bbb' : '#666', 
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                @{person.username}
              </span>
            </>
          )}
          {person.platform === 'github' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={darkMode ? '#fff' : '#333'}>
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span style={{ 
                color: darkMode ? '#bbb' : '#666', 
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {person.username}
              </span>
            </>
          )}
          {person.platform === 'linkedin' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span style={{ 
                color: darkMode ? '#bbb' : '#666', 
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {person.username}
              </span>
            </>
          )}
        </div>

        {/* Accuracy Scores */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 12,
          alignItems: 'center'
        }}>
          {person.scores.map((score, i) => (
            <AccuracyDot 
              key={i}
              score={score} 
              person={person} 
              darkMode={darkMode} 
              isActive={activeTooltip === i}
              onHover={() => setActiveTooltip(i)}
              onLeave={() => setActiveTooltip(null)}
            />
          ))}
        </div>
        
        {/* Relevant Quote */}
        <div style={{ 
          color: darkMode ? '#bbb' : '#999', 
          fontSize: '0.9rem', 
          lineHeight: 1.4,
          position: 'relative',
          paddingLeft: 12,
          borderLeft: `2px solid ${darkMode ? '#444' : '#e5e5e5'}`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          "{person.quote}"
        </div>
      </div>
    </div>
  );
}

function PeopleCardList({ people, darkMode, animationsCompleted, followupSent, onCardClick }) {
  const [visibleCards, setVisibleCards] = React.useState(Array(people.length).fill(false));
  const cardRefs = React.useRef([]);
  
  React.useEffect(() => {
    // If animations were already completed, show all cards immediately
    if (animationsCompleted) {
      setVisibleCards(Array(people.length).fill(true));
      return;
    }
    
    const observers = [];
    people.forEach((_, i) => {
      if (!cardRefs.current[i]) return;
      observers[i] = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Calculate delay based on total cards for better pacing
            const baseDelay = people.length <= 2 ? 300 : people.length <= 4 ? 250 : 200;
            const delay = i * baseDelay;
            
            setTimeout(() => {
              setVisibleCards((prev) => {
                if (prev[i]) return prev;
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, delay);
            observers[i].disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observers[i].observe(cardRefs.current[i]);
    });
    return () => observers.forEach(obs => obs && obs.disconnect());
  }, [people.length, animationsCompleted]);

  return (
    <div style={{
      maxWidth: 700,
      margin: '32px auto 0 auto',
      padding: '0 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: followupSent ? 800 : 160, // Add much more padding when follow-up is sent
    }}>
      {people.map((person, i) => (
        <div key={i} ref={el => cardRefs.current[i] = el}>
          <div onClick={() => onCardClick && onCardClick(person)}>
            <PeopleCard 
              person={person} 
              index={i} 
              visible={visibleCards[i]} 
              darkMode={darkMode} 
              totalCards={people.length}
            />
          </div>
        </div>
      ))}
    </div>
  );
}



export default App;
