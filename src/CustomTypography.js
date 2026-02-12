// CustomTypography.js
import { Text } from '@vkontakte/vkui';

// Жёстко переопределяем шрифт для всех компонентов
const defaultFontFamily = "'Noto Sans Lao', sans-serif";

export function CustomText(props) {
  return (
    <Text
      {...props}
      style={{ fontFamily: defaultFontFamily, ...props.style }}
    />
  );
}