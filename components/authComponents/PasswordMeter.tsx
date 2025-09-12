import React from "react";
import { View, Text } from "react-native";

interface PasswordMeterProps {
  password: string;
}

function getPasswordStrength(password: string) {
  if (!password || password.length < 6) return { label: "Débil", color: "#ef4444" };
  if (/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(password)) return { label: "Fuerte", color: "#22c55e" };
  if (password.length >= 6) return { label: "Media", color: "#f59e42" };
  return { label: "Débil", color: "#ef4444" };
}

export const PasswordMeter: React.FC<PasswordMeterProps> = ({ password }) => {
  const strength = getPasswordStrength(password);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: strength.color, fontWeight: "bold" }}>
        Seguridad de contraseña: {strength.label}
      </Text>
    </View>
  );
};
