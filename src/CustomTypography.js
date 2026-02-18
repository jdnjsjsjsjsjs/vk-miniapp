import { Text } from '@vkontakte/vkui';

const defaultFontFamily = "'Noto Sans Lao', sans-serif";

export function CustomText(props) {
  return (
    <Text
      {...props}
      style={{ fontFamily: defaultFontFamily, ...props.style }}
    />
  );
}