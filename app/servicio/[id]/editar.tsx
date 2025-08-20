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
import { updateService } from "@/helpers/service";
import { getServiceById } from "@/helpers/service_detail";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

interface ServiceData {
  images: string[];
  serviceName: string;
  description: string;
  category: string;
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceData>({
    images: [],
    serviceName: "",
    description: "",
    category: "",
    address: "",
    phone: "",
    email: "",
    serviceTypes: [], // Ahora es opcional
  });
  const [errors, setErrors] = useState<FormErrors>({});

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
    } else if (!/^\d{10}$/.test(serviceData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Ingresa un teléfono válido de 10 dígitos";
    }

    if (!serviceData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(serviceData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }

    if (!serviceData.category) {
      newErrors.category = "Selecciona una categoría";
    }

    // Eliminada la validación de serviceTypes

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const updated = await updateService(id, {
        service_name: serviceData.serviceName,
        description: serviceData.description,
        tipo: serviceData.serviceTypes,
        category: serviceData.category,
        address: serviceData.address,
        photos: serviceData.images,
        phone: serviceData.phone,
        email: serviceData.email,
      });

      Alert.alert("Éxito", "Servicio actualizado correctamente");
      console.log(updated);
      router.back();
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar el servicio");
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceData = (field: keyof ServiceData, value: any) => {
    setServiceData((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getServiceDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getServiceById(id);
      setServiceData({
        images: data.photos,
        serviceName: data.service_name,
        description: data.description,
        category: data.category,
        address: data.address,
        phone: data.phone,
        email: data.email,
        serviceTypes: data.tipo,
      });
      return data;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al obtener la informacion del servicio', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ], {
        cancelable: true
      });
      console.log(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reseteo de todos los estados
      setIsLoading(false);
      getServiceDetails();
      setErrors({});
    }, [])
  );

  return (
    <ScreenContainer androidSafeArea={false}>
      <View className="flex-1 px-4 py-6">
        <FormCard title="Editar detalles del Servicio" scrollable>
          {/* Images Section - Ahora opcional */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Fotos (opcional)</Text>
            <ImageUpload
              maxImages={5}
              initialImages={serviceData.images}
              onImagesChange={(images) => { updateServiceData("images", images); console.log(images) }}
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
            selectedCategory={serviceData.category}
            onCategoryChange={(category) => updateServiceData("category", category)}
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
          {errors.address && (
            <View className="-mt-4 mb-4">
              <Text className="text-red-500 text-xs">{errors.address}</Text>
            </View>
          )}

          {/* Phone */}
          <FormInput
            label="Teléfono"
            value={serviceData.phone}
            onChangeText={(text) => updateServiceData("phone", text)}
            placeholder="Ej: 4491234567"
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
              title="Actualizar"
              onPress={handleUpdate}
              loading={isLoading}
              size="large"
            />
          </View>
        </FormCard>
      </View>
    </ScreenContainer>
  );
}
