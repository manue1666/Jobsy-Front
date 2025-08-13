import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Linking, Switch } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Slider } from 'react-native-elements';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { ThemeContext } from '@/context/themeContext';

export default function ProfileScreen() {
	const { currentTheme, toggleTheme, useSysTheme } = useContext(ThemeContext);
	const isDark = currentTheme === 'dark';
	const textColor = isDark ? 'text-white' : 'text-black';
	const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';
	const cardBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100';
	interface AppData {
		version: string;
	}
	const [appData, setAppData] = useState<AppData | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchRange, setSearchRange] = useState(10); // valor inicial en km


	//Llamada a la API simulada para carga de datos
	useEffect(() => {
		setTimeout(() => {
			setAppData({
				version: '1.0.0',
			});
			setLoading(false);
		}, 1000);
	}, []);

	const options = [
		{
			icon: (color: string) => <Feather name="flag" size={24} color={color} />,
			title: 'Idioma',
			subtitle: 'Cambiar el idioma de la app',
			onPress: useSysTheme
		},
		{
			icon: (color: string) => <Feather name="moon" size={24} color={color} />,
			title: 'Modo oscuro',
			subtitle: 'Cambia entre modos de vista',
			toggle: false,
			onPress: () => router.push('/opciones/tema')
		},
		{
			icon: (color: string) => <Feather name="list" size={24} color={color} />,
			title: 'Informacion de la app',
			subtitle: 'Revisa la informacion de Jobsy',
			//onPress:
		},
		{
			icon: (color: string) => <Feather name="map-pin" size={24} color={color} />,
			title: 'Rango de busqueda',
			hasSlider: true,
			//onPress:
		},
		{
			icon: () => <Image
				source={{ uri: 'https://teteocan.com/wp-content/uploads/2025/06/fav.png' }}
				style={{ width: 32, height: 26, borderRadius: 2, resizeMode: 'cover' }}
			/>,
			title: 'Proyectos Teteocan',
			subtitle: 'Explora las oportunidades Teteocan que te brindaron esta app',
			onPress: () => Linking.openURL("https://teteocan.com/servicios/")
		},
	];

	return (
		<ScreenContainer>
			<SafeAreaView className="flex-1 items-center px-6 py-4 justify-between">

				{loading ? (<ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />) : (
					<>
						<View className="w-full items-center">
							{/* Título */}
							<Text className={`text-3xl font-semibold mb-4 ${textColor}`}>Configuracion</Text>


							{/* Opciones */}
							<View className="w-full space-y-3 mt-4">
								{options.map((option, index) => (
									<TouchableOpacity
										key={index}
										onPress={option.onPress}
										activeOpacity={0.7}
										className={`flex-row items-start p-4 mt-1 rounded-3xl shadow-sm ${cardBg}`}>
										<View className="mr-3">
											{option.icon(isDark ? 'white' : 'black')}
										</View>
										<View className="flex-1">
											<Text className={`font-semibold ${textColor}`}>{option.title}</Text>

											{option.toggle ? (
												<View className="mt-1">
													<Switch
														value={currentTheme === "dark"}
														onValueChange={() =>
															toggleTheme(currentTheme === "light" ? "dark" : "light")
														}
													/>
												</View>
											) : ("")}

											{option.hasSlider ? (
												<View className="mt-1">
													<Slider
														minimumValue={1}
														maximumValue={100}
														step={1}
														value={searchRange}
														onValueChange={setSearchRange}
														minimumTrackTintColor={Colors[currentTheme as keyof typeof Colors].tint}
														maximumTrackTintColor={isDark ? "#ffffff" : "#000000"}
														thumbTintColor={Colors[currentTheme as keyof typeof Colors].tint}
														thumbStyle={{
															height: 14,
															width: 14,
															backgroundColor: Colors[currentTheme as keyof typeof Colors].tint,
															borderRadius: 7,
														}}
														trackStyle={{
															height: 2,
															borderRadius: 3
														}}
													/>
													<Text className={`text-xs mt-1 ${subtitleColor}`}>Rango: {searchRange} km</Text>
												</View>
											) : (
												<Text
													className={`text-sm ${subtitleColor}`}
													numberOfLines={2}
													ellipsizeMode="tail">
													{option.subtitle}
												</Text>
											)}
										</View>
									</TouchableOpacity>
								))}
							</View>
						</View>
						<View className="w-full space-y-3">
							<Text className={`font-semibold ${textColor} text-center`}>v {appData?.version}</Text>
						</View>
					</>
				)}

			</SafeAreaView>
		</ScreenContainer>
	);
}
