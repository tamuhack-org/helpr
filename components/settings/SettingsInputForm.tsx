import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { settingsNameToFieldName } from '@/lib/enum';
import { Input } from '@/components/ui/input';

export const SettingsInputForm = ({
  form,
  name,
  placeholder,
  tooltip,
}: {
  form: any;
  name: string;
  placeholder: string;
  tooltip?: string;
}) => {
  return (
    <FormField
      control={form.control}
      name={ settingsNameToFieldName[name] }
      render={({ field }) => (
        <FormItem>
          <FormLabel>{name}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
          {tooltip && <FormDescription>{tooltip}</FormDescription>}
        </FormItem>
      )}
    />
  );
};
