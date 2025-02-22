import { Button } from '../ui/button';

export const SettingsButtonRow = ({
  title,
  description,
  buttonText,
  onSubmit,
}: {
  title: string;
  description?: string;
  buttonText: string;
  onSubmit: () => void;
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between w-full p-4 border rounded-md md:items-center gap-4">
      <div>
        <p className="text-lg font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 md:w-3/4">{description}</p>
        )}
      </div>
      <Button onClick={onSubmit}>{buttonText}</Button>
    </div>
  );
};
