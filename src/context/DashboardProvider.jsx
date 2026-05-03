import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { AlertCircle, Waves, Wind, Flame, HeartPulse, Truck, Users, MessageSquare, AlertTriangle, ClipboardCheck, Siren, HeartHandshake, Droplets, Shield, Radiation, Activity, MapPin } from 'lucide-react';
import { hasPermission as rbacHasPermission, ROLES, PERMISSIONS, getDefaultRoute, resolveSignupRole } from '../lib/rbac';
import {
  supabase,
  signIn,
  signUp as supabaseSignUp,
  signOut,
  getProfile,
  fetchIncidents,
  createIncident,
  updateIncident,
  fetchIncidentStats,
  fetchResources as fetchResourcesAPI,
  createResource as createResourceAPI,
  updateResource as updateResourceAPI,
  fetchOrganizations,
  fetchMessages,
  createMessage as createMessageAPI,
  createActivityLog,
  fetchActivityLogs,
  subscribeToIncidents,
  subscribeToResources,
  seedDatabaseIfEmpty,
  fetchAllProfiles,
  supabaseUrl,
  supabaseAnonKey
} from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create a secondary client for "Public/Anon" data access to bypass RLS restrictions
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

import { DashboardContext } from './DashboardContext';

export function DashboardProvider({ children }) {
    // --- STATE ---
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('cc_guest_session');
            if (cached) return JSON.parse(cached).user;
            return null;
        } catch (e) { return null; }
    });
    const [profile, setProfile] = useState(() => {
        try {
            const cached = localStorage.getItem('cc_guest_session');
            if (cached) return JSON.parse(cached).profile;
            return null;
        } catch (e) { return null; }
    });
    const [loading, setLoading] = useState(true);
    
    // Initialize state from localStorage to prevent "vanishing" on refresh
    const [incidents, setIncidents] = useState(() => {
        try {
            const cached = localStorage.getItem('cc_incidents');
            if (cached && cached !== 'undefined') {
                const parsed = JSON.parse(cached);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (e) { return []; }
    });
    const [resources, setResources] = useState(() => {
        try {
            const cached = localStorage.getItem('cc_resources');
            if (cached && cached !== 'undefined') {
                const parsed = JSON.parse(cached);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (e) { return []; }
    });
    const [stats, setStats] = useState(() => {
        const defaultStats = { 
            total: 0, active: 0, contained: 0, 
            severity: { critical: 0, high: 0, medium: 0, low: 0 },
            categories: [],
            responseTime: "0.0", criticalIncidents: 0 
        };
        try {
            const cached = localStorage.getItem('cc_stats');
            if (cached && cached !== 'undefined') {
                const parsed = JSON.parse(cached);
                return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : defaultStats;
            }
            return defaultStats;
        } catch (e) {
            return defaultStats;
        }
    });    
    const [organizations, setOrganizations] = useState(() => {
        try {
            const cached = localStorage.getItem('cc_orgs');
            if (cached && cached !== 'undefined') {
                const parsed = JSON.parse(cached);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (e) { return []; }
    });
    const [profiles, setProfiles] = useState(() => {
        try {
            const cached = localStorage.getItem('cc_profiles');
            if (cached && cached !== 'undefined') {
                const parsed = JSON.parse(cached);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (e) { return []; }
    });

    const [toasts, setToasts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [actions, setActions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [workflowId, setWorkflowId] = useState(1);
    
    // --- NEW INTELLIGENCE STATE ---
    const [selectedIncidentId, setSelectedIncidentId] = useState(null);
    const [responders, setResponders] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [autoResponseMode, setAutoResponseMode] = useState(false);

    // --- PERSISTENCE & CACHE SANITIZATION ---
    useEffect(() => {
        const cached = localStorage.getItem('cc_stats');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.total === 72 && parsed.active === 38) {
                    localStorage.removeItem('cc_stats');
                }
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cc_incidents', JSON.stringify(incidents));
    }, [incidents]);
    useEffect(() => {
        localStorage.setItem('cc_resources', JSON.stringify(resources));
    }, [resources]);
    useEffect(() => {
        localStorage.setItem('cc_stats', JSON.stringify(stats));
    }, [stats]);
    useEffect(() => {
        localStorage.setItem('cc_orgs', JSON.stringify(organizations));
    }, [organizations]);
    useEffect(() => {
        localStorage.setItem('cc_profiles', JSON.stringify(profiles));
    }, [profiles]);

    // --- HELPERS ---
    const getIconName = useCallback((type) => {
        const t = (type || '').toLowerCase();
        if (t === 'fire' || t === 'wildfire') return 'Flame';
        if (t === 'flood') return 'Droplets';
        if (t === 'medical') return 'HeartPulse';
        if (t === 'accident' || t === 'collapse') return 'AlertTriangle';
        if (t === 'earthquake') return 'Activity';
        if (t === 'cyclone') return 'Wind';
        if (t === 'chemical') return 'Radiation';
        return 'AlertCircle';
    }, []);

    const formatTimeAgo = useCallback((dateStr) => {
        if (!dateStr) return 'Unknown';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }, []);

    const mapIncidentToAlert = useCallback((inc) => ({
        id: inc.id,
        type: inc.type || 'other',
        title: (inc.type || 'INCIDENT').toUpperCase() + ' REPORTED',
        location: inc.location,
        time: formatTimeAgo(inc.created_at),
        severity: inc.severity,
        status: inc.status || 'REPORTED',
        latitude: inc.latitude,
        longitude: inc.longitude,
        coordinates: [inc.latitude, inc.longitude],
        description: inc.description,
        reporter: inc.reporter_name,
        phone: inc.reporter_phone,
        responseTimeMinutes: inc.response_time_minutes,
        response_time_minutes: inc.response_time_minutes,
        created_at: inc.created_at,
        critical: inc.severity?.toLowerCase() === 'high' || inc.severity?.toLowerCase() === 'critical',
        iconName: getIconName(inc.type)
    }), [formatTimeAgo, getIconName]);

    const calculateStatsFromIncidents = useCallback((incs) => {
        const total = incs.length;
        const active = incs.filter(i => i.status === 'ACTIVE' || i.status === 'REPORTED').length;
        const contained = incs.filter(i => i.status === 'CONTAINED' || i.status === 'RESOLVED').length;
        
        const severityMap = incs.reduce((acc, i) => {
            const sev = (i.severity || 'low').toLowerCase();
            acc[sev] = (acc[sev] || 0) + 1;
            return acc;
        }, {});

        const withResponse = incs.filter(i => i.responseTimeMinutes != null);
        const avgResponse = withResponse.length > 0
            ? (withResponse.reduce((sum, i) => sum + Number(i.responseTimeMinutes || 0), 0) / withResponse.length).toFixed(1)
            : '0.0';

        const criticalCount = (severityMap.critical || 0) + (severityMap.high || 0);

        return {
            total, active, contained, severity: severityMap,
            responseTime: avgResponse, criticalIncidents: criticalCount
        };
    }, [incidents]);

    // Intelligence Side-Effects: Derived from Stats
    useEffect(() => {
        if (!stats) return;

        const newRecs = [];
        if (stats.criticalIncidents > 0) {
            newRecs.push({
                id: Date.now() + 1,
                priority: 'CRITICAL',
                text: `Deploy immediate medical support to Sector ${Math.floor(Math.random() * 50) + 100}`,
                action: 'DEPLOY_AIR_AMBULANCE'
            });
        }
        const tacticalLoad = Math.round((stats.active / (stats.total || 1)) * 100);
        if (tacticalLoad > 60) {
            newRecs.push({
                id: Date.now() + 3,
                priority: 'SYSTEM',
                text: `System load exceeding 60% (${tacticalLoad}%). Optimizing resource routing...`,
                action: 'OPTIMIZE_LOGISTICS'
            });
        }
        setRecommendations(newRecs);
    }, [stats]);

    // --- DATA FETCHING (PURE SUPABASE) ---
    const refreshData = useCallback(async () => {
        try {
            console.log("DashboardContext: [SYNC] Fetching live data from Supabase...");
            
            // Background seed check to ensure 72 items exist in cloud
            await seedDatabaseIfEmpty();

            const results = await Promise.allSettled([
                supabase.from('incidents').select('*').order('created_at', { ascending: false }).then(r => r.data || []),
                supabase.from('resources').select('*').order('name').then(r => r.data || []),
                supabase.from('organizations').select('*').order('name').then(r => r.data || []),
                supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(20).then(r => r.data || []),
                supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20).then(r => r.data || []),
                supabase.from('profiles').select('*').order('name').then(r => r.data || []),
                supabase.from('tactical_actions').select('*').eq('status', 'pending').order('created_at', { ascending: true }).then(r => r.data || [])
            ]);

            const incData = results[0].status === 'fulfilled' ? results[0].value : [];
            const resData = results[1].status === 'fulfilled' ? results[1].value : [];
            const orgData = results[2].status === 'fulfilled' ? results[2].value : [];
            const msgData = results[3].status === 'fulfilled' ? results[3].value : [];
            const logData = results[4].status === 'fulfilled' ? results[4].value : [];
            const profData = results[5].status === 'fulfilled' ? results[5].value : [];
            const tactData = results[6].status === 'fulfilled' ? results[6].value : [];
            
            const mappedIncs = incData.map(mapIncidentToAlert);
            setIncidents(mappedIncs);
            setResources(resData);
            setOrganizations(orgData);
            setProfiles(profData);
            
            // Use tactical_actions table for the primary Action Queue
            const mappedActions = tactData.map(act => ({
                ...act,
                time: act.time || formatTimeAgo(act.created_at)
            }));
            
            setActions(mappedActions);
            setStats(calculateStatsFromIncidents(mappedIncs));
            setMessages(msgData.map(m => {
                let timeStr = 'Just now';
                try {
                    if (m.created_at) {
                        timeStr = new Date(m.created_at).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
                    }
                } catch (e) { console.error("Time Parse Error", e); }
                return { ...m, time: timeStr };
            }));
        } catch (err) {
            console.error('DashboardContext: [SYNC_ERROR]', err);
        }
    }, [calculateStatsFromIncidents, mapIncidentToAlert]);

    // --- INITIALIZATION ---
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                // Initial Sync
                await refreshData();

                // 1. Check for Tactical Guest Session first (Persistence Fix)
                const cachedGuest = localStorage.getItem('cc_guest_session');
                if (cachedGuest && cachedGuest !== 'undefined') {
                    const { user: gUser, profile: gProfile } = JSON.parse(cachedGuest);
                    if (mounted && gUser && gProfile) {
                        setUser(gUser);
                        setProfile(gProfile);
                        setLoading(false);
                        return; // Found valid tactical session
                    }
                }

                // 2. Check Supabase Auth
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted && session?.user) {
                    setUser(session.user);
                    const p = await getProfile(session.user.id);
                    if (mounted) setProfile(p);
                }
            } catch (err) {
                console.error("DashboardContext: [INIT_ERROR]", err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        init();
        
        // Failsafe: Ensure loading is disabled after a maximum of 3 seconds 
        // to prevent infinite "AUTHENTICATING..." screens on network/init hang.
        const loadingFailsafe = setTimeout(() => {
            if (mounted) {
                setLoading(current => {
                    if (current) console.warn("DashboardContext: [FAILSAFE_TRIGGERED] Auth took too long.");
                    return false;
                });
            }
        }, 3000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            // If we have a manual demo session, ignore Supabase auth changes unless it's a SIGN_OUT
            const isDemo = localStorage.getItem('cc_guest_session');
            if (isDemo && event !== 'SIGNED_OUT') {
                setLoading(false);
                return;
            }

            // Start loading while we re-sync profile
            let authChangeFailsafe = null;
            if (event === 'SIGNED_IN') {
                setLoading(true);
                authChangeFailsafe = setTimeout(() => {
                    if (mounted) setLoading(false);
                }, 3000);
            }

            setUser(session?.user ?? null);
            if (!session?.user) {
                setProfile(null);
            }
            
            if (session?.user) {
                try {
                    const p = await getProfile(session.user.id);
                    if (mounted) {
                        // Fallback profile if DB entry is missing
                        if (!p) {
                            setProfile({
                                id: session.user.id,
                                name: session.user.user_metadata?.name || 'Authorized Responder',
                                role: 'official', // Default to official for recognized auth
                                email: session.user.email
                            });
                        } else {
                            setProfile(p);
                        }
                        await refreshData();
                    }
                } catch (err) {
                    console.error("Profile Fetch Error:", err);
                    // Critical Fallback to prevent RoleGuard lockout
                    if (mounted) {
                        setProfile({
                            id: session.user.id,
                            name: session.user.user_metadata?.name || 'Authorized Responder',
                            role: 'official',
                            email: session.user.email
                        });
                    }
                } finally {
                    if (mounted) {
                        setLoading(false);
                        if (authChangeFailsafe) clearTimeout(authChangeFailsafe);
                    }
                }
            } else {
                setProfile(null);
                setLoading(false);
                if (authChangeFailsafe) clearTimeout(authChangeFailsafe);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(loadingFailsafe);
            subscription?.unsubscribe();
        };
    }, [refreshData]);

    // --- REALTIME & POLLING ---
    useEffect(() => {
        const sub = supabase.channel('dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => refreshData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => refreshData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => refreshData())
            .subscribe();
        
        // Polling as a secondary sync mechanism for intelligent state
        const poll = setInterval(refreshData, 15000);
        
        return () => { 
            sub.unsubscribe(); 
            clearInterval(poll);
        };
    }, [refreshData]);

    // --- RESPONDER MOVEMENT SIMULATION ---
    useEffect(() => {
        const initialResponders = [
            { id: 'R1', name: 'UNIT_ALPHA', type: 'AMBULANCE', coords: [13.345, 74.745] },
            { id: 'R2', name: 'UNIT_BRAVO', type: 'FIRE_TRUCK', coords: [13.335, 74.735] },
            { id: 'R3', name: 'UNIT_CHARLIE', type: 'POLICE', coords: [13.355, 74.755] },
            { id: 'R4', name: 'UNIT_DELTA', type: 'RESCUE', coords: [13.325, 74.725] },
        ];
        setResponders(initialResponders);

        const movement = setInterval(() => {
            setResponders(prev => prev.map(r => ({
                ...r,
                coords: [
                    r.coords[0] + (Math.random() - 0.5) * 0.001,
                    r.coords[1] + (Math.random() - 0.5) * 0.001
                ]
            })));
        }, 3000);

        return () => clearInterval(movement);
    }, []);

    // --- ACTIONS ---
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const login = useCallback(async (formData) => {
        setLoading(true);
        try {
            // --- TACTICAL DEMO BYPASS (RESTORED PER USER REQUEST) ---
            const isDemoEmail = formData.email === 'lak@gmail.com';
            const isDemoPass = formData.password === 'password' || formData.password === 'lak123@#';
            
            if (isDemoEmail && isDemoPass) {
                const demoUser = { id: 'demo-lak', email: 'lak@gmail.com', user_metadata: { name: 'LAKSHYA' } };
                const demoProfile = { id: 'demo-lak', name: 'LAKSHYA', role: 'admin', email: 'lak@gmail.com' };
                
                setUser(demoUser);
                setProfile(demoProfile);
                localStorage.setItem('cc_guest_session', JSON.stringify({ user: demoUser, profile: demoProfile }));
                
                setLoading(false);
                addToast('Tactical Demo Access Granted', 'success');
                return { user: demoUser };
            }

            const data = await signIn(formData);
            addToast('Access Granted', 'success');
            return data;
        } catch (err) {
            addToast(err.message, 'error');
            throw err;
        } finally { 
            setLoading(false); 
        }
    }, [addToast]);

    const loginAsGuest = useCallback(async (role = 'official') => {
        setLoading(true);
        try {
            // Mock tactical session
            const mockUser = { id: 'guest-node', email: 'tactical@crisischain.net', user_metadata: { full_name: 'TACTICAL_OPERATIVE' } };
            const mockProfile = { id: 'guest-node', name: 'TACTICAL_OPERATIVE', role: role, organization: 'GOC_COMMAND' };
            
            setUser(mockUser);
            setProfile(mockProfile);
            localStorage.setItem('cc_guest_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
            addToast('Emergency Guest Access Granted', 'warning');
            return { user: mockUser };
        } finally { setLoading(false); }
    }, [addToast]);

    const logout = useCallback(async () => {
        // Step 1: Clear all localStorage cache immediately to prevent stale rehydration
        localStorage.removeItem('cc_guest_session');
        localStorage.removeItem('cc_incidents');
        localStorage.removeItem('cc_resources');
        localStorage.removeItem('cc_stats');
        localStorage.removeItem('cc_orgs');
        localStorage.removeItem('cc_profiles');

        // Step 2: Clear React state immediately so UI reacts at once
        setUser(null);
        setProfile(null);

        // Step 3: Fire Supabase signOut in the background (non-blocking)
        signOut().catch((err) => console.error('signOut error (non-blocking):', err));

        addToast('Session terminated', 'info');
    }, [addToast]);

    const createResourceAction = async (res) => {
        try {
            // The DB currently lacks a 'unit' column, so we append it to the name for now
            const { unit, ...rest } = res;
            const displayName = unit ? `${rest.name} (${unit})` : rest.name;

            const { data, error } = await supabase.from('resources').insert([{
                ...rest,
                name: displayName,
                deployed: rest.deployed ?? 0,
                status: 'available'
            }]).select();
            
            if (error) throw error;
            await refreshData();
            addToast('Resource Provisioned', 'success');
            return data[0];
        } catch (err) {
            console.error("DashboardProvider: [RESOURCE_ERROR]", err);
            addToast(err.message || 'Provisioning Failed', 'error');
            throw err;
        }
    };

    const updateStatus = useCallback(async (id, status) => {
        try {
            const { error } = await supabase.from('incidents').update({ status }).eq('id', id);
            if (error) throw error;

            // Enhanced Logging for Command System
            await supabase.from('activity_logs').insert([{
                user_id: user?.id,
                action_type: 'STATUS_UPDATE',
                details: `Incident ${id} status updated to: ${status}. [PRIORITY:High] [SOURCE:COMMAND_CENTER]`
            }]);

            addToast(`Status: ${status}`, 'success');
            refreshData();
        } catch (err) { addToast('Update failed', 'error'); }
    }, [user?.id, addToast, refreshData]);

    const addAlert = useCallback(async (alert) => {
        try {
            console.log("DashboardContext: [UPLINK] Broadcasting alert:", alert);
            const { data, error } = await supabase.from('incidents').insert([
                { ...alert, status: 'REPORTED', created_at: new Date().toISOString() }
            ]).select();
            
            if (error) throw error;
            
            addToast(`Emergency Broadcast: ${alert.type.toUpperCase()}`, 'warning');
            
            // Log the creation
            await supabase.from('activity_logs').insert([{
                user_id: user?.id,
                action_type: 'ALERT_BROADCAST',
                details: `System broadcast alert: ${alert.type} at ${alert.location}. [PRIORITY:High] [SOURCE:REPORTER]`
            }]);

            // Auto Response Logic
            if (autoResponseMode && data?.[0]) {
                const incId = data[0].id;
                setTimeout(async () => {
                    await updateStatus(incId, 'ACTIVE');
                    addToast(`AUTO_RESPONSE: Dispatching units to ${alert.location}`, 'success');
                }, 1500);
            }

            refreshData();
        } catch (err) { addToast('Broadcast failed', 'error'); }
    }, [user?.id, autoResponseMode, addToast, refreshData, updateStatus]);

    const allocateResource = useCallback(async (resourceId, quantity) => {
        try {
            const resource = resources.find(r => r.id === resourceId);
            if (!resource) return;

            const newAvailable = Math.max(0, (resource.available ?? resource.total) - quantity);
            const { error } = await supabase.from('resources').update({ 
                available: newAvailable,
                deployed: (resource.deployed || 0) + quantity 
            }).eq('id', resourceId);

            if (error) throw error;

            await supabase.from('activity_logs').insert([{
                user_id: user?.id,
                action_type: 'RESOURCE_ALLOCATED',
                details: `Allocated ${quantity} of ${resource.name}. Remaining: ${newAvailable}`
            }]);

            addToast(`Allocation Successful: ${quantity} units`, 'success');
            refreshData();
        } catch (err) { addToast('Allocation failed', 'error'); }
    }, [user?.id, resources, addToast, refreshData]);

    const updateResource = useCallback(async (id, updates) => {
        try {
            const { error } = await supabase.from('resources').update(updates).eq('id', id);
            if (error) throw error;
            refreshData();
        } catch (err) { addToast('Update failed', 'error'); }
    }, [addToast, refreshData]);

    const deleteIncidentAction = useCallback(async (id) => {
        try {
            const { error } = await supabase.from('incidents').delete().eq('id', id);
            if (error) throw error;
            await refreshData();
            addToast('Incident Deleted', 'success');
        } catch (err) {
            addToast('Delete Failed', 'error');
        }
    }, [addToast, refreshData]);

    const addMessage = async (sender, text) => {
        try {
            await createMessageAPI({ sender, text, status: 'Active' });
        } catch (err) { addToast('Comm Error', 'error'); }
    };

    const getIcon = useCallback((name) => {
        const icons = { 
            AlertCircle, Waves, Wind, Flame, HeartPulse, Truck, Users, 
            Droplets, Shield, Radiation, Activity, MapPin, AlertTriangle, Siren, HeartHandshake, ClipboardCheck
        };
        return icons[name] || AlertCircle;
    }, []);

    const signup = async (formData) => {
        setLoading(true);
        try {
            const data = await supabaseSignUp(formData);
            addToast('Registration Successful', 'success');
            return data;
        } catch (err) {
            addToast(err.message, 'error');
            throw err;
        } finally { setLoading(false); }
    };

    const contextValue = useMemo(() => ({
        // ── AUTH & RBAC ──
        user, profile, loading,
        userRole: profile?.role || ROLES.USER,
        hasPermission: (perm) => rbacHasPermission(profile?.role || ROLES.USER, perm),
        PERMISSIONS,
        getDefaultRoute: () => getDefaultRoute(profile?.role || ROLES.USER),
        // ── DATA ──
        incidents, actions, messages, resources, stats, organizations, profiles, toasts,
        // ── UI STATE ──
        isSidebarOpen, isMobileMenuOpen, toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
        closeSidebar: () => setIsSidebarOpen(false), toggleMobileMenu: () => setIsMobileMenuOpen(!isMobileMenuOpen),
        // ── ACTIONS ──
        login, loginAsGuest, signup, logout, addMessage, addAlert, updateStatus, createResourceAction, deleteIncidentAction,
        addOrganization: async (o) => { await supabase.from('organizations').insert([o]); refreshData(); },
        updateOrganization: async (id, u) => { await supabase.from('organizations').update(u).eq('id', id); refreshData(); },
        deleteOrganization: async (id) => { await supabase.from('organizations').delete().eq('id', id); refreshData(); },
        updateProfileRole: async (id, r) => { await supabase.from('profiles').update({ role: r }).eq('id', id); refreshData(); },
        deleteProfile: async (id) => { await supabase.from('profiles').delete().eq('id', id); refreshData(); },
        getIcon, searchQuery, setSearchQuery, addToast, refreshData, getIconName, formatTimeAgo, workflowId, advanceWorkflow: () => setWorkflowId(w => Math.min(w + 1, 4)),
        // ── INTELLIGENCE ──
        selectedIncidentId, setSelectedIncidentId, 
        selectedIncident: incidents.find(i => i.id === selectedIncidentId),
        responders, recommendations,
        executeAction: async (id, action) => {
            addToast(`EXECUTING: ${action}`, 'success');
            setRecommendations(prev => prev.filter(r => r.id !== id));
            await supabase.from('activity_logs').insert([{
                user_id: user?.id,
                action_type: 'AI_DECISION_EXECUTE',
                details: `Operator executed recommended action: ${action}. [PRIORITY:High] [SOURCE:AI_CORE]`
            }]);
            await addMessage('SYSTEM_AI', `COMMAND_EXECUTED: ${action} [REF_ID: ${id}]`);
            refreshData();
        },
        autoResponseMode, setAutoResponseMode,
        allocateResource,
        acknowledgeAction: async (id) => { 
            try {
                await supabase.from('tactical_actions').update({ status: 'acknowledged' }).eq('id', id);
                setActions(prev => prev.filter(a => a.id !== id));
                addToast('Action Acknowledged', 'success'); 
            } catch (err) { addToast('Update Failed', 'error'); }
        },
        escalateAction: async (id) => { 
            try {
                await supabase.from('tactical_actions').update({ status: 'escalated' }).eq('id', id);
                setActions(prev => prev.filter(a => a.id !== id));
                addToast('Protocol C4 Escalated', 'warning'); 
            } catch (err) { addToast('Escalation Failed', 'error'); }
        }
    }), [
        user, profile, loading, incidents, actions, messages, resources, stats, organizations, profiles, toasts,
        isSidebarOpen, isMobileMenuOpen, searchQuery, workflowId, selectedIncidentId, responders, recommendations, autoResponseMode,
        login, loginAsGuest, signup, logout, addMessage, addAlert, updateStatus, createResourceAction, deleteIncidentAction,
        getIcon, setSearchQuery, addToast, refreshData, getIconName, formatTimeAgo, allocateResource
    ]);

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
}
