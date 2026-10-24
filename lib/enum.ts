enum SettingsFieldName {
  Name = 'name',
  BannerText = 'bannerText',
  Url = 'url',
}

export const enum SettingsFieldText {
  Name = 'Name',
  BannerText = 'Banner Text',
  Url = 'Live Site URL',
}

export const settingsNameToFieldName: Record<string, SettingsFieldName> = {
  "Event Name": SettingsFieldName.Name,
  "Banner Text": SettingsFieldName.BannerText,
  "Live Site URL": SettingsFieldName.Url,
};
