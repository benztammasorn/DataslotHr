
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { handleLineLogin, checkUserAuthorization, storeLineUserInfo, getLineUserInfo } from '@/services/lineAuth';
import { fetchUserCompanies, getUniqueCompanies, storeSelectedCompany } from '@/services/companyService';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const userInfo = await getLineUserInfo();
      if (userInfo) {
        console.log('User already logged in');
        router.replace('/(tabs)/(home)');
      }
    } catch (err) {
      console.log('Error checking existing login:', err);
    }
  };

  const performAuthorization = async (lineId: string, profile?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching companies for Line ID:', lineId);
      
      // Step 1: Fetch user's companies from the user search API
      const companies = await fetchUserCompanies(lineId);
      
      if (companies.length === 0) {
        setError('ไม่พบบริษัทในระบบ กรุณาติดต่อผู้ดูแลระบบ');
        Alert.alert(
          'ไม่พบข้อมูลบริษัท',
          'บัญชี LINE ของคุณยังไม่ได้ลงทะเบียนกับบริษัทใดๆ กรุณาติดต่อผู้ดูแลระบบ',
          [{ text: 'ตกลง', onPress: () => setError(null) }]
        );
        setIsLoading(false);
        return;
      }

      console.log(`Found ${companies.length} company records`);
      
      // Step 2: Get unique companies
      const uniqueCompanies = getUniqueCompanies(companies);
      console.log(`${uniqueCompanies.length} unique companies`);

      // Step 3: If only one company, auto-select it
      if (uniqueCompanies.length === 1) {
        const selectedCompany = uniqueCompanies[0];
        console.log('Only one company found, auto-selecting:', selectedCompany.company);
        
        // Store selected company
        await storeSelectedCompany(selectedCompany);
        
        // Check authorization for this company
        const authResult = await checkUserAuthorization(lineId, selectedCompany.company);
        
        if (authResult.authorized) {
          console.log('User authorized, storing info and navigating...');
          
          // Store user info with employee details
          const userInfoToStore = {
            ...authResult.data,
            employeeInfo: authResult.employeeInfo,
          };
          await storeLineUserInfo(lineId, userInfoToStore, profile, selectedCompany.company);
          
          // Navigate to home screen
          router.replace('/(tabs)/(home)');
        } else {
          setError('ไม่มีสิทธิ์เข้าถึงบริษัทนี้ กรุณาติดต่อผู้ดูแลระบบ');
          Alert.alert(
            'ไม่มีสิทธิ์เข้าถึง',
            `คุณไม่มีสิทธิ์เข้าถึงบริษัท ${selectedCompany.company} กรุณาติดต่อผู้ดูแลระบบ`,
            [{ text: 'ตกลง', onPress: () => setError(null) }]
          );
        }
      } else {
        // Step 4: Multiple companies - show selection screen
        console.log('Multiple companies found, showing selection screen');
        
        // Store companies temporarily for selection screen
        await AsyncStorage.setItem('tempCompanies', JSON.stringify(uniqueCompanies));
        
        // Store LINE profile for later use
        await AsyncStorage.setItem('tempLineProfile', JSON.stringify({ lineId, profile }));
        
        // Navigate to company selection screen
        router.replace('/company-selection');
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      console.log('Authorization error:', err);
      Alert.alert('เกิดข้อผิดพลาด', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting Line OAuth login...');
      const result = await handleLineLogin();
      
      console.log('Login result:', result.success ? 'Success' : 'Failed');
      
      if (result.success && result.userId) {
        console.log('Login successful, User ID:', result.userId);
        await performAuthorization(result.userId, result.profile);
      } else {
        const errorMsg = result.error || 'เข้าสู่ระบบไม่สำเร็จ';
        setError(errorMsg);
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMsg);
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      console.log('Login error:', err);
      Alert.alert('เกิดข้อผิดพลาด', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.appName}>TimeWise HR</Text>
          <Text style={styles.tagline}>ระบบบันทึกเวลาทำงาน</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* LINE Logo */}
          <View style={styles.lineLogoContainer}>
            <Text style={styles.lineLogoText}>LINE</Text>
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>ยินดีต้อนรับ</Text>
          <Text style={styles.descriptionText}>
            เข้าสู่ระบบด้วยบัญชี LINE{'\n'}เพื่อเริ่มใช้งาน
          </Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* LINE Login Button */}
          <Pressable
            style={[
              styles.lineButton,
              isLoading && styles.lineButtonDisabled
            ]}
            onPress={handleLoginPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.lineButtonText}>กำลังเข้าสู่ระบบ...</Text>
              </>
            ) : (
              <Text style={styles.lineButtonText}>เข้าสู่ระบบด้วย LINE</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            การเข้าสู่ระบบถือว่าคุณยอมรับ{'\n'}ข้อกำหนดและเงื่อนไขการใช้งาน
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    alignItems: 'center',
  },
  lineLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#06C755',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#06C755',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lineLogoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorText: {
    fontSize: 14,
    color: '#DC3545',
    textAlign: 'center',
    lineHeight: 20,
  },
  lineButton: {
    width: '100%',
    backgroundColor: '#06C755',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#06C755',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lineButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  lineButtonDisabled: {
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
