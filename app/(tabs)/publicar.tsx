import React, { useState } from 'react';
import { View, Alert, Text } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { FormCard } from '@/components/authComponents/FormCard';
import { FormInput } from '@/components/authComponents/FormInput';
import { PrimaryButton } from '@/components/authComponents/PrimaryButton';
import { ImageUpload } from '@/components/mainComponents/publicar/subirImagen';
import { ServiceTypeSelector } from '@/components/mainComponents/publicar/escogerServicio';
import { LocationInput } from '@/components/mainComponents/publicar/escogerLocalizacion';

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
  serviceTypes?: string;
}

export default function PublicarScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [serviceData, setServiceData] = useState<ServiceData>({
    images: [],
    serviceName: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    serviceTypes: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!serviceData.serviceName.trim()) {
      newErrors.serviceName = 'El nombre del servicio es requerido';
    }

    if (!serviceData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!serviceData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!serviceData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(serviceData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un teléfono válido de 10 dígitos';
    }

    if (!serviceData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(serviceData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (serviceData.serviceTypes.length === 0) {
      newErrors.serviceTypes = 'Selecciona al menos un tipo de servicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setIsLoading(true);
      
      // Here you would typically send the data to your backend
      console.log('Publishing service:', serviceData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Éxito',
        'Tu servicio ha sido publicado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form or navigate away
              setServiceData({
                images: [],
                serviceName: '',
                description: '',
                address: '',
                phone: '',
                email: '',
                serviceTypes: [],
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo publicar el servicio. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceData = (field: keyof ServiceData, value: any) => {
    setServiceData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-4 py-6">
        <FormCard title="Publicar Servicio" scrollable>
          {/* Images Section */}
          <View className="mb-6">
            <ImageUpload
              maxImages={5}
              onImagesChange={(images) => updateServiceData('images', images)}
            />
          </View>

          {/* Service Name */}
          <FormInput
            label="Nombre de tu servicio"
            value={serviceData.serviceName}
            onChangeText={(text) => updateServiceData('serviceName', text)}
            placeholder="Ej: Electricista profesional"
            error={errors.serviceName}
            isRequired
          />

          {/* Description */}
          <FormInput
            label="Descripción del servicio"
            value={serviceData.description}
            onChangeText={(text) => updateServiceData('description', text)}
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
            onChangeText={(text) => updateServiceData('address', text)}
            onLocationSelect={(location) => {
              updateServiceData('address', location.address);
              // You could also store coordinates for later use
              console.log('Location selected:', location);
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
            onChangeText={(text) => updateServiceData('phone', text)}
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
            onChangeText={(text) => updateServiceData('email', text)}
            placeholder="tu@correo.com"
            error={errors.email}
            isRequired
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Service Types */}
          <ServiceTypeSelector
            onSelectionChange={(types) => updateServiceData('serviceTypes', types)}
            allowMultiple
          />
          {errors.serviceTypes && (
            <View className="-mt-4 mb-4">
              <Text className="text-red-500 text-xs">{errors.serviceTypes}</Text>
            </View>
          )}

          {/* Submit Button */}
          <View className="mt-8">
            <PrimaryButton
              title="Guardar"
              onPress={handlePublish}
              loading={isLoading}
              size="large"
            />
          </View>
        </FormCard>
      </View>
    </ScreenContainer>
  );
}