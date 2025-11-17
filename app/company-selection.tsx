import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { CompanyInfo, getUniqueCompanies, storeSelectedCompany } from '@/services/companyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CompanySelectionScreen() {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      // Get companies from temporary storage (set by login screen)
      const companiesJson = await AsyncStorage.getItem('tempCompanies');
      if (companiesJson) {
        const allCompanies = JSON.parse(companiesJson) as CompanyInfo[];
        const uniqueCompanies = getUniqueCompanies(allCompanies);
        setCompanies(uniqueCompanies);
        console.log(`Loaded ${uniqueCompanies.length} unique companies`);
      } else {
        console.log('No companies found in storage');
        Alert.alert('Error', 'No companies found. Please login again.');
        router.replace('/login');
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Error loading companies:', error);
      Alert.alert('Error', 'Failed to load companies');
      setIsLoading(false);
    }
  };

  const handleCompanySelect = async (company: CompanyInfo) => {
    try {
      setSelectedCompany(company.company);
      
      // Store selected company
      await storeSelectedCompany(company);
      
      // Get LINE profile from temporary storage
      const tempLineProfileJson = await AsyncStorage.getItem('tempLineProfile');
      if (!tempLineProfileJson) {
        throw new Error('Session expired. Please login again.');
      }
      
      const { lineId, profile } = JSON.parse(tempLineProfileJson);
      
      // Import necessary functions
      const { checkUserAuthorization, storeLineUserInfo } = await import('@/services/lineAuth');
      
      // Check authorization for selected company
      console.log('Checking authorization for company:', company.company);
      const authResult = await checkUserAuthorization(lineId, company.company);
      
      if (authResult.authorized) {
        console.log('User authorized for company:', company.company);
        
        // Store user info with employee details
        const userInfoToStore = {
          ...authResult.data,
          employeeInfo: authResult.employeeInfo,
        };
        await storeLineUserInfo(lineId, userInfoToStore, profile, company.company);
        
        // Clear temporary storage
        await AsyncStorage.removeItem('tempCompanies');
        await AsyncStorage.removeItem('tempLineProfile');
        
        console.log('Company selected and authorized:', company.company);
        
        // Navigate to home screen
        setTimeout(() => {
          router.replace('/(tabs)/(home)');
        }, 300);
      } else {
        setSelectedCompany(null);
        Alert.alert(
          'Authorization Failed',
          `You are not authorized to access ${company.company}. Please contact your administrator.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error selecting company:', error);
      Alert.alert('Error', String(error));
      setSelectedCompany(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return colors.accent;
      case 'INACTIVE':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'checkmark.circle.fill';
      case 'INACTIVE':
        return 'xmark.circle.fill';
      default:
        return 'questionmark.circle.fill';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading companies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <IconSymbol 
              name="building.2.fill"
              size={48}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.title}>Select Company</Text>
          <Text style={styles.subtitle}>
            Choose the company you want to access
          </Text>
        </View>

        <View style={styles.companiesContainer}>
          {companies.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <IconSymbol 
                name="exclamationmark.triangle.fill"
                size={48}
                color={colors.secondary}
              />
              <Text style={styles.emptyTitle}>No Companies Found</Text>
              <Text style={styles.emptyText}>
                Your account is not associated with any companies.
                Please contact your administrator.
              </Text>
            </View>
          ) : (
            companies.map((company) => (
              <Pressable
                key={company.id}
                style={[
                  styles.companyCard,
                  { backgroundColor: colors.card },
                  selectedCompany === company.company && styles.companyCardSelected
                ]}
                onPress={() => handleCompanySelect(company)}
                disabled={selectedCompany !== null}
              >
                <View style={styles.companyHeader}>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyName}>{company.company}</Text>
                    <Text style={styles.companyModule}>{company.module}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(company.status) + '20' }]}>
                    <IconSymbol 
                      name={getStatusIcon(company.status)}
                      size={16}
                      color={getStatusColor(company.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(company.status) }]}>
                      {company.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.companyDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="person.fill" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{company.role}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol name="number" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{company.employeeNumber}</Text>
                  </View>
                  {company.userInfo?.displayName && (
                    <View style={styles.detailRow}>
                      <IconSymbol name="person.crop.circle" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{company.userInfo.displayName}</Text>
                    </View>
                  )}
                </View>

                {selectedCompany === company.company && (
                  <View style={styles.selectedOverlay}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  companiesContainer: {
    gap: 16,
  },
  companyCard: {
    borderRadius: 12,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  companyCardSelected: {
    borderColor: colors.primary,
    opacity: 0.7,
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  companyModule: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  companyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

