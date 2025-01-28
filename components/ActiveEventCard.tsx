import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  userId: number;
};

const EventCard: React.FC<{
  item: Event;
  userId: number | null;
  handleDetailsEvent: (event: Event) => void;
  handleAdministrarEvent: (event: Event) => void;
  handleUnsubscribe: (eventId: number) => void;
  openDeleteModal: (eventId: number) => void;
  handleDeleteEvent: (eventId: number) => void;
}> = ({
  item,
  userId,
  handleDetailsEvent,
  handleAdministrarEvent,
  handleUnsubscribe,
  openDeleteModal,
}) => {

    return (
      <TouchableOpacity style={styles.eventCard} activeOpacity={0.9}>
        <View style={styles.headerSection}>
          <Text style={styles.eventName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.eventDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.eventDescription} numberOfLines={3}>{item.description}</Text>
        <View style={styles.actionButtons}>
          {userId !== null && item.userId === userId && (
            <>
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => handleAdministrarEvent(item)}
              >
                <Text style={styles.adminButtonText}>Administrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => openDeleteModal(item.id)}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </>
          )}
          {userId !== null && item.userId !== userId && (
            <>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => handleDetailsEvent(item)}
              >
                <Text style={styles.detailsButtonText}>Detalles</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.unsubscribeButton}
                onPress={() => handleUnsubscribe(item.id)}
              >
                <Text style={styles.unsubscribeButtonText}>Desuscribirse</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6b7280',
    backgroundColor: '#f1f1f1',
    padding: 4,
    borderRadius: 5,
    textAlign: 'right',
    maxWidth: '40%',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 10,
  },
  eventDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  adminButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailsButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  unsubscribeButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  unsubscribeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  }
});

export default EventCard;