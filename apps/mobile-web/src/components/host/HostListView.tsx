import { useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NearbyHost } from '@/hooks/useNearbyHosts';
import { HostCard } from './HostCard';

interface HostListViewProps {
  hosts: NearbyHost[];
  isLoading: boolean;
  onRefresh: () => void;
  onHostPress: (hostId: string) => void;
}

const PAGE_SIZE = 10;

export function HostListView({ hosts, isLoading, onRefresh, onHostPress }: HostListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(hosts.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedHosts = hosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show: 1 2 3 ... 8 9 10 or 1 ... 5 6 7 ... 10
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Empty state
  if (!isLoading && hosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Hosts Found</Text>
        <Text style={styles.emptyMessage}>
          There are no hosts in this area. Try searching in a different location.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedHosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HostCard host={item} onPress={() => onHostPress(item.id)} />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          hosts.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.resultCount}>
                Showing {startIndex + 1}-{Math.min(endIndex, hosts.length)} of {hosts.length} hosts
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.paginationContainer}>
              {/* Previous Button */}
              <Pressable
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
              >
                <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#007AFF'} />
              </Pressable>

              {/* Page Numbers */}
              <View style={styles.pageNumbersContainer}>
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
                        ...
                      </Text>
                    );
                  }

                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <Pressable
                      key={pageNum}
                      onPress={() => handlePageChange(pageNum)}
                      style={[styles.pageButton, isActive && styles.pageButtonActive]}
                    >
                      <Text style={[styles.pageButtonText, isActive && styles.pageButtonTextActive]}>
                        {pageNum}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Next Button */}
              <Pressable
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]}
              >
                <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#007AFF'} />
              </Pressable>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pageButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pageButtonTextActive: {
    color: '#fff',
  },
  ellipsis: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
});
