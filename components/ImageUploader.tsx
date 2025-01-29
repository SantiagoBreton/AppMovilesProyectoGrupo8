import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { uploadUserProfileImage } from "@/apiCalls/uploadUserProfileImage";
import { uploadUserBannerImage } from "@/apiCalls/uploadUserBannerImage";

interface ImageUploaderProps {
  isVisible: boolean;
  onClose: () => void;
}

const imgDir = FileSystem.documentDirectory + "images/";

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ isVisible, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const tabUnderline = new Animated.Value(0);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    await ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(imgDir);
    setImages(files.map((f) => imgDir + f));
  };

  const selectImage = async (useLibrary: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    };

    const result = useLibrary
      ? await ImagePicker.launchImageLibraryAsync(options)
      : await ImagePicker.launchCameraAsync(options);

    if (!result.canceled) {
      saveImage(result.assets[0].uri);
    }
  };

  const saveImage = async (uri: string) => {
    const filename = new Date().getTime() + ".jpeg";
    const dest = imgDir + filename;
    await FileSystem.copyAsync({ from: uri, to: dest });
    setImages([...images, dest]);
  };

  const uploadImage = async (uri: string, isProfile: boolean) => {
    setUploading(true);
    const success = isProfile
      ? await uploadUserProfileImage(uri)
      : await uploadUserBannerImage(uri);
    setUploading(false);
    if (success) {
     
    } else {
      console.error("Failed to upload image");
    }
  };

  const handleTabSwitch = (index: number) => {
    setActiveTab(index);
    Animated.timing(tabUnderline, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderImageItem = (item: any, isProfile: boolean) => {
    const filename = item.split("/").pop();
    return (
      <View style={styles.imageRow}>
        <Image style={styles.image} source={{ uri: item }} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.imageText}>{filename}</Text>
        </View>
        <TouchableOpacity onPress={() => uploadImage(item, isProfile)}>
          <Ionicons name="cloud-upload" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteImage(item)}>
          <Ionicons name="trash" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    );
  };

  const deleteImage = async (uri: string) => {
    await FileSystem.deleteAsync(uri);
    setImages(images.filter((i) => i !== uri));
  };

  return (
    <Modal visible={isVisible} transparent={false} animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabSwitch(0)}
          >
            <Text style={[styles.tabText, activeTab === 0 && styles.activeTab]}>
              Profile Images
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabSwitch(1)}
          >
            <Text style={[styles.tabText, activeTab === 1 && styles.activeTab]}>
              Banners
            </Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.tabUnderline,
            {
              left: tabUnderline.interpolate({
                inputRange: [0, 1],
                outputRange: ["5%", "55%"],
              }),
            },
          ]}
        />
        <View style={styles.content}>
          <Text style={styles.title}>
            {activeTab === 0
              ? "Upload Your Profile Image"
              : "Upload Your Banner"}
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectImage(true)}
          >
            <Text style={styles.uploadButtonText}>Select Image</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>History of Uploaded Images</Text>
          <FlatList
            data={images}
            renderItem={({ item }) => renderImageItem(item, activeTab === 0)}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        {uploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTab: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  tabUnderline: {
    position: "absolute",
    height: 3,
    width: "40%",
    backgroundColor: "#4CAF50",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    color: "#666",
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  imageText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  }
});

export default ImageUploader;
