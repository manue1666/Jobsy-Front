import React, { useCallback, useState } from "react";
import { View, Alert, Text } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { FormInput } from "@/components/authComponents/FormInput";
import { PrimaryButton } from "@/components/authComponents/PrimaryButton";
import { ImageUpload } from "@/components/mainComponents/publicar/subirImagen";
import { ServiceTypeSelector } from "@/components/mainComponents/publicar/escogerServicio";
import { LocationInput } from "@/components/mainComponents/publicar/escogerLocalizacion";
import { CategorySelector } from "@/components/mainComponents/publicar/escogerCategoria";
import { createService } from "@/helpers/service";
import { router, useFocusEffect } from "expo-router";
import { getUserServices } from "@/helpers/service";
import { getUserProfile } from "../../helpers/profile";
import { useAlert } from "@/components/mainComponents/Alerts";

interface ServiceData {
  images: string[];
  serviceName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  serviceTypes: string[];
}

interface FormErrors {
  serviceName?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
} // Eliminado serviceTypes de los errores

export default function PublicarScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceData>({
    images: [],
    serviceName: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    serviceTypes: [], // Ahora es opcional
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [geocodeError, setGeocodeError] = useState<{
    message: string;
    suggestions?: string[];
    detectedAddress?: string;
  } | null>(null);
  const { okAlert, errAlert } = useAlert();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!serviceData.serviceName.trim()) {
      newErrors.serviceName = "El nombre del servicio es requerido";
    }

    if (!serviceData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!serviceData.address.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!serviceData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else {
      // Solo números, entre 10 y 15 dígitos
      const digits = serviceData.phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        newErrors.phone = "Ingresa un teléfono válido";
      }
    }

    if (!serviceData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(serviceData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }

    if (!selectedCategory) {
      newErrors.category = "Selecciona una categoría";
    }

    // Eliminada la validación de serviceTypes

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setGeocodeError(null);

      await createService(
        {
          service_name: serviceData.serviceName,
          category: selectedCategory,
          description: serviceData.description,
          phone: serviceData.phone,
          email: serviceData.email,
          address: serviceData.address,
          tipo: serviceData.serviceTypes,
        },
        serviceData.images
      );

      okAlert("Éxito", "Servicio publicado correctamente");
      router.replace("/(tabs)");

    } catch (error: any) {
      console.error("Error al publicar el servicio:", error);

      // Manejar errores de geocodificación (sin 'low_confidence')
      if (error?.code && (
        error.code === 'no_results' ||
        error.code === 'address_too_short' ||
        error.code === 'timeout' ||
        error.code === 'network_error'
      )) {
        setGeocodeError({
          message: error.message,
          suggestions: error.suggestions,
          detectedAddress: error.detectedAddress,
        });

        errAlert(
          "Dirección no válida",
          "Hubo un problema con la dirección proporcionada. Revisa las sugerencias a continuación."
        );
      } else if (error?.message?.includes('teléfono ya está registrado')) {
        errAlert(
          "Teléfono duplicado",
          "Este número de teléfono ya está registrado en otro servicio."
        );
      } else if (error?.message?.includes('límite de servicios')) {
        errAlert(
          "Límite alcanzado",
          error.message
        );
      } else {
        errAlert(
          "Error",
          error.message || "No se pudo publicar el servicio. Intenta más tarde"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceData = (field: keyof ServiceData, value: any) => {
    setServiceData((prev) => ({ ...prev, [field]: value }));

    // Limpiar errores al escribir
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    
    // Limpiar error de geocodificación si se está editando la dirección
    if (field === 'address' && geocodeError) {
      setGeocodeError(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reseteo de todos los estados
      setIsLoading(false);
      setServiceData({
        images: [],
        serviceName: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        serviceTypes: [],
      });
      setErrors({});
      setSelectedCategory("");
      // Obtener si el usuario es premium y cuántos servicios tiene
      (async () => {
        try {
          const user = await getUserProfile();
          setIsPremium(!!user?.user?.isPremium);
          setServicesCount(user?.user?.servicesCount ?? 0);
        } catch {
          setIsPremium(false);
          setServicesCount(0);
        }
      })();
    }, [])
  );

  const maxServices = isPremium ? 5 : 1;
  const canPublish = servicesCount < maxServices;

  return (
    <ScreenContainer>
      <View className="flex-1 px-4 py-6">
        <FormCard title="Publicar Servicio" scrollable>
          {/* Aviso premium */}
          <View className="mb-4">
            <Text className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
              <Text className="font-bold">Usuarios Premium:</Text> pueden
              publicar hasta 5 servicios y cada servicio puede tener hasta 9
              imágenes.
            </Text>
          </View>
          {/* Aviso de límite de servicios */}
          {!canPublish && (
            <View className="mb-4">
              <Text className="text-xs text-red-700 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
                Has alcanzado el límite de servicios permitidos ({servicesCount}
                /{maxServices}) para tu tipo de cuenta.
              </Text>
            </View>
          )}
          {/* Images Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">
              Fotos {isPremium ? "(hasta 9)" : "(solo 1)"}
            </Text>
            <ImageUpload
              maxImages={isPremium ? 9 : 1}
              onImagesChange={(images) => updateServiceData("images", images)}
            />
          </View>

          {/* Service Name */}
          <FormInput
            label="Nombre de tu servicio"
            value={serviceData.serviceName}
            onChangeText={(text) => updateServiceData("serviceName", text)}
            placeholder="Ej: Electricista profesional"
            error={errors.serviceName}
            isRequired
          />

          {/* Category Selector */}
          <CategorySelector
            label="Categoría"
            isRequired={true}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          {errors.category && (
            <View className="-mt-4 mb-4">
              <Text className="text-red-500 text-xs">{errors.category}</Text>
            </View>
          )}

          {/* Description */}
          <FormInput
            label="Descripción del servicio"
            value={serviceData.description}
            onChangeText={(text) => updateServiceData("description", text)}
            placeholder="Describe tu servicio, experiencia y especialidades..."
            error={errors.description}
            isRequired
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Address */}
          <LocationInput
            value={serviceData.address}
            onChangeText={(text) => updateServiceData("address", text)}
            onLocationSelect={(location) => {
              updateServiceData("address", location.address);
              console.log("Location selected:", location);
            }}
          />
          
          {/* Mostrar error de geocodificación con sugerencias */}
          {geocodeError && (
            <View className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-800 font-semibold mb-2">
                ⚠️ Problema con la dirección
              </Text>
              <Text className="text-red-700 text-sm mb-3">
                {geocodeError.message}
              </Text>
              
              {geocodeError.suggestions && geocodeError.suggestions.length > 0 && (
                <View className="mb-2">
                  <Text className="text-red-800 font-semibold text-sm mb-1">
                    Sugerencias:
                  </Text>
                  {geocodeError.suggestions.map((suggestion, index) => (
                    <Text key={index} className="text-red-700 text-xs ml-2 mb-1">
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              )}
              
              {geocodeError.detectedAddress && (
                <View className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <Text className="text-yellow-800 text-xs">
                    <Text className="font-semibold">Dirección detectada:</Text>{'\n'}
                    {geocodeError.detectedAddress}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {errors.address && !geocodeError && (
            <View className="-mt-4 mb-4">
              <Text className="text-red-500 text-xs">{errors.address}</Text>
            </View>
          )}

          {/* Phone */}
          <FormInput
            label="Teléfono"
            value={serviceData.phone}
            onChangeText={(text) => updateServiceData("phone", text)}
            placeholder="Ej: (52)2221234567"
            error={errors.phone}
            isRequired
            keyboardType="phone-pad"
            maxLength={15}
          />

          {/* Email */}
          <FormInput
            label="Correo electrónico"
            value={serviceData.email}
            onChangeText={(text) => updateServiceData("email", text)}
            placeholder="tu@correo.com"
            error={errors.email}
            isRequired
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Service Types - Ahora opcional */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">
              Tipo de servicio (opcional)
            </Text>
            <ServiceTypeSelector
              onSelectionChange={(types) =>
                updateServiceData("serviceTypes", types)
              }
              allowMultiple
            />
          </View>

          {/* Submit Button */}
          <View className="mt-8">
            <PrimaryButton
              title="Publicar Servicio"
              onPress={handlePublish}
              loading={isLoading}
              size="large"
              disabled={!canPublish}
            />
          </View>
        </FormCard>
      </View>
    </ScreenContainer>
  );
}
