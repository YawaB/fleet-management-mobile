import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet, Alert, Image, FlatList } from "react-native";
import {
  Button,
  Divider,
  Card,
  Text,
  Chip,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchPannes, getPanes, removePanne } from "../../slice/panne.slice";
import { useDispatch, useSelector } from "react-redux";
import { colors } from '../../../../theme/colors';
import { useFocusEffect } from "@react-navigation/native";

function PaneList({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const panes = useSelector(getPanes);

  const navigateToEditor = (pane) => {
    navigation.navigate("Editor", { pane });
  };

  const handleDelete = (pane) => {
    Alert.alert(
      'Delete Incident',
      `Are you sure you want to delete incident "${pane.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // TODO: Add delete logic here
            console.log('Deleting pane:', pane.id);
            dispatch(removePanne({id: pane.id})).then(({ payload }) => {
              if (payload) {
                dispatch(fetchPannes());
              }
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderPaneCard = (pane) => (
    <Card
      style={styles.card}
      key={pane.id}
    >
      {(() => {
        const baseUrl = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE || "";

        const isImagePath = (p) =>
          typeof p === "string" && /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(p);

        const parseMaybeJsonArray = (s) => {
          try {
            if (typeof s === "string" && s.trim().startsWith("[")) {
              const arr = JSON.parse(s);
              return Array.isArray(arr) ? arr : [];
            }
          } catch (e) {
            // ignore
          }
          return [];
        };

        const normalize = (items) => {
          console.log("items list", items);
          if (!items) return [];
          const arr = Array.isArray(items) ? items : [items];
          const out = [];
          for (const it of arr) {
            if (!it) continue;
            console.log("it list", typeof  it);
            if (typeof it === "object") {
              if (it.uri && isImagePath(it.uri)) out.push(it.uri);
              else if (it.path && isImagePath(it.path)) out.push(it.path);
              else if (it.src) {
                if (typeof it.src === "string" && it.src.trim().startsWith("[")) {
                  const parsed = parseMaybeJsonArray(it.src);
                  parsed.forEach((p) => {
                    if (typeof p === "string" && isImagePath(p.src)) {
                      out.push(baseUrl + p.src);
                    }
                  });
                } else if (typeof it.src === "string" && isImagePath(it.src)) {
                  out.push(it.src.startsWith("http") || it.src.startsWith("file") ? it.src : baseUrl + it.src);
                }
              }
            } else if (typeof it === "string") {
              const parsed = parseMaybeJsonArray(it);
              if (parsed.length) {
                parsed.forEach((p) => {
                  console.log("p list", p);
                  if (isImagePath(p.src)) out.push(baseUrl + p.src);
                });
              } else if (isImagePath(it)) {
                out.push(it.startsWith("http") || it.startsWith("file") ? it : baseUrl + it);
              }
            }
          }
          // dedupe
          return Array.from(new Set(out));
        };

        const sources = normalize(pane?.images || pane?.image);
        if (sources.length > 1) {
          console.log("sources > 1", sources);
          return (
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={sources}
              keyExtractor={(uri, idx) => `${pane.id}-${idx}`}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 300,
                    height: 250,
                    borderColor: "white",
                    borderWidth: 2,
                    
                  }}
                  resizeMode="cover"
                />
              )}
              style={styles.carouselContainer}
            />
          );
        }

        const single = sources[0] || (pane?.image ? baseUrl + pane.image : 'https://picsum.photos/700');
        return (
          <Card.Cover
            source={{ uri: single }}
            style={styles.cardImage}
          />
        );
      })()}
      <Card.Content>
        <View className="">
          <View className="flex flex-row items-center gap-2 mt-2">
            <Text
              numberOfLines={1}
              variant="titleMedium"
              style={styles.title}
            >
              {pane.name.length > 20 ? `${pane.name.slice(0, 17)}...` : pane.name}
            </Text>
            <Chip
              className="flex items-center justify-center"
              style={[
                { backgroundColor: pane.categoryBgColor || colors.primary }
              ]}
              textStyle={{ color: pane.categoryColor || '#fff' }}
            >
              {pane.CategoryTypeName}
            </Chip>
          </View>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="car" size={20} color={colors.gray[600]} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {pane.marque} - {pane.licensePlate}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="alert" size={20} color={colors.gray[600]} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {pane.Symptome}
          </Text>
        </View>
        {pane.Description && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="text" size={20} color={colors.gray[600]} />
            <Text variant="bodyMedium" style={styles.infoText}>
              {pane.Description}
            </Text>
          </View>
        )}
        <View style={styles.cardFooter}>
          <Chip 
          className="flex items-center justify-center"
          textStyle={{ color: '#fff' }}
            style={{ 
              backgroundColor: pane.panneImmobilisante === 'oui' ? '#EF4444' : '#10B981'
            }}
          >
            {pane.panneImmobilisante === 'oui' ? 'Immobilizing' : 'Not Immobilizing'}
          </Chip>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button
          icon="pencil"
          mode="text"
          onPress={() => navigateToEditor(pane)}
        >
          Edit
        </Button>
        <Button
          icon="delete"
          mode="text"
          textColor="#dc2626"
          onPress={() => handleDelete(pane)}
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  useFocusEffect(
    useCallback(() => {
      try {
        dispatch(fetchPannes());
      } catch (err) {
        console.log("Error fetch panes", err.message);
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <View className="flex flex-row justify-between items-center p-4">
        <Text variant="titleMedium" style={styles.headerTitle}>
          Incidents
        </Text>
        <Button
          mode="text"
          icon="plus"
          onPress={() => navigateToEditor()}
          style={styles.addButton}
        >
          {t("add_incident")}
        </Button>
      </View>
      <Divider />
      <ScrollView style={styles.content}>
        {panes.map((pane) => renderPaneCard(pane))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardImage: {
    height: 250,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  statusChip: {

    height: 28,
  },
  immobilizeChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: colors.gray[700],
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addButton: {
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  immobilizeChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  carouselContainer: {
    height: 200,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
});

export default PaneList;
