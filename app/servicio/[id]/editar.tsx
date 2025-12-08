import React, { useCallback, useState } from "react";
import { View, Alert, Text, ScrollView } from "react-native";
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
import { useAlert } from "@/components/mainComponents/Alerts";

interface ServiceData {
  images: string[];
  serviceName: string;
  description: string;
  category: string;
  address: string;
  coordinates: { latitude: number | null; longitude: number | null }; 
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
}

export default function PublicarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceData>({
    images: [],
    serviceName: "",
    description: "",
    category: "",
    address: "",
    coordinates: { latitude: null, longitude: null },
    phone: "",
    email: "",
    serviceTypes: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
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
    } else if (!serviceData.coordinates.latitude || !serviceData.coordinates.longitude) {
      newErrors.address = "Por favor, verifica la dirección o usa GPS para confirmar la ubicación";
    }

    if (!serviceData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else {
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

    if (!serviceData.category) {
      newErrors.category = "Selecciona una categoría";
    }

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
        latitude: serviceData.coordinates.latitude,
        longitude: serviceData.coordinates.longitude,
        photos: serviceData.images,
        phone: serviceData.phone,
        email: serviceData.email,
      });

      okAlert("Éxito", "Servicio actualizado correctamente");
      router.back();
    } catch (err) {
      errAlert("Error", "No se pudo actualizar el servicio");
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
        coordinates: {
          latitude: data.service_location?.coordinates?.[1] || null,
          longitude: data.service_location?.coordinates?.[0] || null,
        },
        phone: data.phone,
        email: data.email,
        serviceTypes: data.tipo,
      });
    } catch (err: any) {
      errAlert("Error", err.message || "No se pudo cargar el servicio");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(false);
      getServiceDetails();
      setErrors({});
    }, [])
  );

  return (
    <ScreenContainer androidSafeArea={false}>
      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <FormCard title="Editar detalles del Servicio" scrollable={false}>
          {/* Images Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Fotos (opcional)</Text>
            <ImageUpload
              maxImages={5}
              initialImages={serviceData.images}
              onImagesChange={(images) => { 
                updateServiceData("images", images); 
                console.log(images) 
              }}
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
            coordinates={serviceData.coordinates}
            onChangeText={(text) => updateServiceData("address", text)}
            onLocationSelect={(location) => {
              setServiceData(prev => ({
                ...prev,
                address: location.address,
                coordinates: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              }));
              if (errors.address) {
                setErrors(prev => ({ ...prev, address: undefined }));
              }
            }}
          />
          {errors.address && (
            <Text className="text-red-500 text-sm mt-1">{errors.address}</Text>
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

          {/* Service Types */}
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
      </ScrollView>
    </ScreenContainer>
  );
}
