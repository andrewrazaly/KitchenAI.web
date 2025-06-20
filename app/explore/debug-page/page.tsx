'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../../feature_import_instagram/components/ui/button";
import { useSupabase } from '../../hooks/useSupabase';
import { 
  getSavedCreators, 
  SavedCreator 
} from '../../../feature_import_instagram/lib/saved-creators-service';

export default function DebugPage() {
  const { isSignedIn, user } = useAuth();
  const supabase = useSupabase();
  const [localStorageData, setLocalStorageData] = useState<string | null>(null);
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);
  const [supabaseData, setSupabaseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage
    const localData = localStorage.getItem('kitchen_ai_saved_creators');
    setLocalStorageData(localData);
    
    // Load saved creators
    loadSavedCreators();
    
    // Test Supabase connection
    testSupabaseConnection();
  }, [supabase]);

  const loadSavedCreators = async () => {
    try {
      const creators = await getSavedCreators(supabase);
      setSavedCreators(creators);
    } catch (error: any) {
      console.error('Error loading saved creators:', error);
      setError(error.message);
    }
  };

  const testSupabaseConnection = async () => {
    if (!supabase) {
      setSupabaseData({ error: 'No Supabase client available' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_creators')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        setSupabaseData({ error: error.message, code: error.code });
      } else {
        setSupabaseData({ success: true, count: data });
        
        // Try to fetch sample data
        const { data: sampleData, error: sampleError } = await supabase
          .from('saved_creators')
          .select('*')
          .limit(5);
        
        setSupabaseData(prev => ({ 
          ...prev, 
          sampleData, 
          sampleError: sampleError?.message 
        }));
      }
    } catch (error: any) {
      setSupabaseData({ error: error.message });
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('kitchen_ai_saved_creators');
    setLocalStorageData(null);
  };

  const addTestData = () => {
    const testData = ['gordonramsay', 'jamieoliver', 'tasty'];
    localStorage.setItem('kitchen_ai_saved_creators', JSON.stringify(testData));
    setLocalStorageData(JSON.stringify(testData));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Page - Saved Creators</h1>
        
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* localStorage Data */}
        <Card>
          <CardHeader>
            <CardTitle>localStorage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Key:</strong> kitchen_ai_saved_creators</p>
            <p><strong>Value:</strong> {localStorageData || 'null'}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={addTestData}>Add Test Data</Button>
              <Button variant="outline" onClick={clearLocalStorage}>Clear localStorage</Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Creators from Service */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Creators (from getSavedCreators)</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Count:</strong> {savedCreators.length}</p>
            {savedCreators.length > 0 ? (
              <ul className="list-disc list-inside mt-2">
                {savedCreators.map(creator => (
                  <li key={creator.creator_username}>
                    @{creator.creator_username} 
                    {creator.id && ` (ID: ${creator.id})`}
                    {creator.saved_at && ` - Saved: ${new Date(creator.saved_at).toLocaleString()}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No creators found</p>
            )}
            {error && (
              <p className="text-red-600 mt-2">Error: {error}</p>
            )}
          </CardContent>
        </Card>

        {/* Supabase Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            {supabaseData ? (
              <div>
                {supabaseData.error ? (
                  <div>
                    <p className="text-red-600"><strong>Error:</strong> {supabaseData.error}</p>
                    {supabaseData.code && <p><strong>Code:</strong> {supabaseData.code}</p>}
                  </div>
                ) : (
                  <div>
                    <p className="text-green-600">✅ Connection successful</p>
                    <p><strong>Total records:</strong> {supabaseData.count}</p>
                    {supabaseData.sampleData && (
                      <div className="mt-2">
                        <p><strong>Sample data:</strong></p>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                          {JSON.stringify(supabaseData.sampleData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {supabaseData.sampleError && (
                      <p className="text-red-600">Sample data error: {supabaseData.sampleError}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p>Testing connection...</p>
            )}
            <Button onClick={testSupabaseConnection} className="mt-4">Retest Connection</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 