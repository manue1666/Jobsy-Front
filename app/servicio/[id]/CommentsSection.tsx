import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  getCommentsByService,
  addComment,
  deleteComment,
} from "@/helpers/comments";
import { ThemeContext } from "@/context/themeContext";
import { getUserProfile } from "@/helpers/profile";
import { useAlert } from "@/components/mainComponents/Alerts";

interface CommentsSectionProps {
  serviceId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ serviceId }) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  // Colores dinámicos basados en el tema
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const secondaryTextColor = isDark ? "text-gray-300" : "text-gray-600";
  const cardBgColor = isDark ? "bg-gray-800" : "bg-gray-50";

  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { okAlert, errAlert } = useAlert();

  // Obtener usuario autenticado (simple y directo)
  const loadProfileData = async () => {
    setUserLoading(true);
    try {
      const data = await getUserProfile();
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      errAlert('Error', err.message || 'No se pudo cargar la información del perfil');
      console.log(err);
      return null;
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // Cargar comentarios
  const fetchComments = useCallback(async () => {
    if (!serviceId) return;
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const data = await getCommentsByService(serviceId);
      setComments(data.comments || []);
    } catch (err) {
      setCommentsError("No se pudieron cargar los comentarios");
    } finally {
      setCommentsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Agregar comentario
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await addComment(serviceId, newComment.trim());
      setNewComment("");
      await fetchComments();
    } catch (err) {
      errAlert("Error", "No se pudo agregar el comentario");
    } finally {
      setPosting(false);
    }
  };

  // Eliminar comentario propio
  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Estás seguro de que deseas eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              await fetchComments();
            } catch {
              errAlert("Error", "No se pudo eliminar el comentario");
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* Botón para abrir comentarios */}
      <View className="mt-8 mb-8">
        <TouchableOpacity
          className="bg-blue-500 py-3 px-6 rounded-full flex-row items-center justify-center"
          onPress={() => setModalVisible(true)}
        >
          <Feather name="message-circle" size={20} color="white" />
          <Text className="text-white ml-2">Ver comentarios</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de comentarios */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className={bgColor}
        >
          <View className="flex-1">
            {/* Header modal */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <Text className={`text-xl font-bold ${textColor}`}>
                Comentarios
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={28} color={isDark ? "#fff" : "#111"} />
              </TouchableOpacity>
            </View>

            {/* Lista de comentarios */}
            <ScrollView className="flex-1 px-4 py-2">
              {commentsLoading || userLoading ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : commentsError ? (
                <Text className="text-red-500">{commentsError}</Text>
              ) : comments.length === 0 ? (
                <Text className={secondaryTextColor}>
                  No hay comentarios aún.
                </Text>
              ) : (
                comments.map((c) => (
                  <View
                    key={c._id}
                    className={`${cardBgColor} rounded-lg p-3 mb-3 flex-row justify-between items-start`}
                  >
                    <View className="flex-1">
                      <Text className={`font-semibold ${textColor}`}>
                        {c.user_id?.name || "Usuario"}
                      </Text>
                      <Text className={`mt-1 ${secondaryTextColor}`}>
                        {c.comment}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {user && c.user_id?._id === user._id && (
                      <TouchableOpacity
                        className="ml-2"
                        onPress={() => handleDeleteComment(c._id)}
                      >
                        <Feather name="trash-2" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            {/* Input para nuevo comentario */}
            <View className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-900">
              <View className="flex-row items-center">
                <TextInput
                  className={`flex-1 rounded-full px-4 py-2 border ${isDark ? "border-gray-700 text-gray-100 bg-gray-800" : "border-gray-300 text-gray-800 bg-gray-100"}`}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  value={newComment}
                  onChangeText={setNewComment}
                  editable={!posting}
                  maxLength={300}
                  returnKeyType="send"
                  onSubmitEditing={handleAddComment}
                />
                <TouchableOpacity
                  className="ml-2 bg-blue-500 rounded-full px-4 py-2"
                  onPress={handleAddComment}
                  disabled={posting || !newComment.trim()}
                >
                  <Feather name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CommentsSection;
