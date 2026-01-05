import { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Animated, StyleSheet } from 'react-native';

interface RadioProps {
    checked: boolean;
    onPress: () => void;
    activeColor?: string;
    inactiveColor?: string;
}

export function Radio({
    checked,
    onPress,
    activeColor = '#6366F1',
    inactiveColor = '#9CA3AF',
}: RadioProps) {
    const scaleAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: checked ? 1 : 0,
            useNativeDriver: true,
            friction: 6,
        }).start();
    }, [checked]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.outer,
                { borderColor: checked ? activeColor : inactiveColor },
            ]}
        >
            <Animated.View
                style={[
                    styles.inner,
                    {
                        backgroundColor: activeColor,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    outer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});