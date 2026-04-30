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
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [actions, setActions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [workflowId, setWorkflowId] = useState(1);

    // --- PERSISTENCE ---
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
            ? (withResponse.reduce((sum, i) => sum + i.responseTimeMinutes, 0) / withResponse.length).toFixed(1)
            : '0.0';

        return {
            total, active, contained, severity: severityMap,
            responseTime: avgResponse, criticalIncidents: severityMap.critical || 0
        };
    }, []);

    // --- DATA FETCHING (PUBLIC CLIENT) ---
    const refreshData = useCallback(async () => {
        try {
            console.log("DashboardContext: [SYNC] Fetching from Public Client...");
            const [incData, resData, orgData, msgData, logData, profData] = await Promise.all([
                supabase.from('incidents').select('*').order('created_at', { ascending: false }).then(r => r.data || []),
                supabase.from('resources').select('*').order('name').then(r => r.data || []),
                supabase.from('organizations').select('*').order('name').then(r => r.data || []),
                supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(20).then(r => r.data || []),
                supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(15).then(r => r.data || []),
                supabase.from('profiles').select('*').order('name').then(r => r.data || [])
            ]);
            
            const mappedIncs = incData.map(mapIncidentToAlert);
            setIncidents(mappedIncs);
            setResources(resData);
            setOrganizations(orgData);
            setProfiles(profData);
            setActions(logData);
            setStats(calculateStatsFromIncidents(mappedIncs));
            setMessages(msgData.map(m => ({
                ...m,
                time: new Date(m.created_at).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })
            })));
            console.log(`DashboardContext: [SYNC_COMPLETE] Found ${mappedIncs.length} incidents.`);
        } catch (err) {
            console.error('DashboardContext: [SYNC_ERROR]', err);
        }
    }, [calculateStatsFromIncidents, mapIncidentToAlert]);

    // --- INITIALIZATION ---
    useEffect(() => {
        let mounted = true;
        const failsafe = setTimeout(() => mounted && setLoading(false), 5000);

        const init = async () => {
            try {
                // Background Seed Check
                seedDatabaseIfEmpty().catch(() => {});

                // Initial Sync
                await refreshData();

                // Auth Check
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted && session?.user) {
                    setUser(session.user);
                    getProfile(session.user.id).then(p => mounted && setProfile(p));
                }
            } catch (err) {
                console.error("DashboardContext: [INIT_ERROR]", err);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(failsafe);
                }
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    getProfile(session.user.id).then(p => mounted && setProfile(p));
                    refreshData();
                } else {
                    setProfile(null);
                }
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
            clearTimeout(failsafe);
        };
    }, [refreshData]);

    // --- REALTIME ---
    useEffect(() => {
        const sub = supabase.channel('dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => refreshData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => refreshData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => refreshData())
            .subscribe();
        return () => { sub.unsubscribe(); };
    }, [refreshData]);

    // --- ACTIONS ---
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const login = async (formData) => {
        setLoading(true);
        try {
            const data = await signIn(formData);
            addToast('Access Granted', 'success');
            return data;
        } catch (err) {
            addToast(err.message, 'error');
            throw err;
        } finally { setLoading(false); }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut();
            addToast('Logged Out', 'info');
        } finally {
            setUser(null);
            setProfile(null);
            setLoading(false);
        }
    };

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

    const addAlert = async (alert) => {
        try {
            const created = await createIncident({
                ...alert,
                status: 'REPORTED',
                user_id: user?.id || null,
                severity: (alert.severity || 'medium').toLowerCase()
            });
            await refreshData();
            addToast('Incident Reported', 'success');
            return mapIncidentToAlert(created);
        } catch (err) {
            addToast('Report Failed', 'error');
            throw err;
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateIncident(id, { status: status.toUpperCase() });
            await refreshData();
            addToast('Status Updated', 'success');
        } catch (err) {
            addToast('Update Failed', 'error');
        }
    };

    const deleteIncidentAction = async (id) => {
        try {
            const { error } = await supabase.from('incidents').delete().eq('id', id);
            if (error) throw error;
            await refreshData();
            addToast('Incident Deleted', 'success');
        } catch (err) {
            addToast('Delete Failed', 'error');
        }
    };

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

    return (
        <DashboardContext.Provider value={{
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
            login, signup: () => {}, logout, addMessage, addAlert, updateStatus, createResourceAction, deleteIncidentAction,
            addOrganization: async (o) => { await supabase.from('organizations').insert([o]); refreshData(); },
            updateOrganization: async (id, u) => { await supabase.from('organizations').update(u).eq('id', id); refreshData(); },
            deleteOrganization: async (id) => { await supabase.from('organizations').delete().eq('id', id); refreshData(); },
            updateProfileRole: async (id, r) => { await supabase.from('profiles').update({ role: r }).eq('id', id); refreshData(); },
            deleteProfile: async (id) => { await supabase.from('profiles').delete().eq('id', id); refreshData(); },
            getIcon, searchQuery, setSearchQuery, addToast, refreshData, getIconName, formatTimeAgo, workflowId, advanceWorkflow: () => setWorkflowId(w => Math.min(w + 1, 4))
        }}>
            {children}
        </DashboardContext.Provider>
    );
}
