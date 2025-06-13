'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function DatabaseDiagnostic() {
  const { isSignedIn, user } = useAuth();
  const supabase = useSupabase();
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {};

    try {
      // Test 1: Check if Supabase client exists
      results.supabaseClient = !!supabase;

      // Test 2: Check authentication
      results.isSignedIn = isSignedIn;
      results.userId = user?.id || null;

      if (supabase) {
        // Test 3: Check saved_reels table
        try {
          const { data, error } = await supabase
            .from('saved_reels')
            .select('count(*)')
            .limit(1);
          results.savedReelsTable = { exists: !error, error: error?.message, data };
        } catch (error: any) {
          results.savedReelsTable = { exists: false, error: error.message };
        }

        // Test 4: Check if user can query their saved reels
        if (isSignedIn) {
          try {
            const { data, error } = await supabase
              .from('saved_reels')
              .select('*')
              .limit(5);
            results.userSavedReels = { success: !error, error: error?.message, count: data?.length || 0 };
          } catch (error: any) {
            results.userSavedReels = { success: false, error: error.message };
          }
        }

        // Test 5: Check collections table (if exists)
        try {
          const { data, error } = await supabase
            .from('collections')
            .select('count(*)')
            .limit(1);
          results.collectionsTable = { exists: !error, error: error?.message };
        } catch (error: any) {
          results.collectionsTable = { exists: false, error: error.message };
        }

        // Test 6: Test inserting a sample reel (then delete it)
        if (isSignedIn) {
          try {
            const testReel = {
              user_id: user?.id,
              reel_id: 'test-reel-' + Date.now(),
              reel_data: JSON.stringify({ test: true }),
              saved_at: new Date().toISOString()
            };

            const { data: insertData, error: insertError } = await supabase
              .from('saved_reels')
              .insert(testReel)
              .select()
              .single();

            if (!insertError && insertData) {
              // Clean up test data
              await supabase
                .from('saved_reels')
                .delete()
                .eq('id', insertData.id);
              
              results.insertTest = { success: true, message: 'Can insert and delete' };
            } else {
              results.insertTest = { success: false, error: insertError?.message };
            }
          } catch (error: any) {
            results.insertTest = { success: false, error: error.message };
          }
        }
      }
    } catch (error: any) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setTesting(false);
  };

  const copyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(testResults, null, 2));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDiagnostics} disabled={testing}>
            {testing ? 'Testing...' : 'Run Database Tests'}
          </Button>
          {Object.keys(testResults).length > 0 && (
            <Button onClick={copyResults} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              Copy Results
            </Button>
          )}
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
            
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${testResults.supabaseClient ? 'bg-green-100' : 'bg-red-100'}`}>
                ✓ Supabase Client: {testResults.supabaseClient ? 'Connected' : 'Not Connected'}
              </div>
              
              <div className={`p-2 rounded ${testResults.isSignedIn ? 'bg-green-100' : 'bg-yellow-100'}`}>
                ✓ Authentication: {testResults.isSignedIn ? 'Signed In' : 'Not Signed In'}
              </div>
              
              {testResults.savedReelsTable && (
                <div className={`p-2 rounded ${testResults.savedReelsTable.exists ? 'bg-green-100' : 'bg-red-100'}`}>
                  ✓ Saved Reels Table: {testResults.savedReelsTable.exists ? 'Exists' : 'Missing'}
                  {testResults.savedReelsTable.error && <div className="text-red-600">{testResults.savedReelsTable.error}</div>}
                </div>
              )}
              
              {testResults.userSavedReels && (
                <div className={`p-2 rounded ${testResults.userSavedReels.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  ✓ User Saved Reels Query: {testResults.userSavedReels.success ? `Success (${testResults.userSavedReels.count} items)` : 'Failed'}
                  {testResults.userSavedReels.error && <div className="text-red-600">{testResults.userSavedReels.error}</div>}
                </div>
              )}
              
              {testResults.insertTest && (
                <div className={`p-2 rounded ${testResults.insertTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  ✓ Database Write Test: {testResults.insertTest.success ? 'Success' : 'Failed'}
                  {testResults.insertTest.error && <div className="text-red-600">{testResults.insertTest.error}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 