function getTimezoneOffset(tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
    });
    const part = fmt.formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
    if (!part) return '+00:00';
    const v = part.value;
    if (v === 'GMT') return '+00:00';
    return v.replace('GMT', '');
  } catch {
    return '+00:00';
  }
}

export function getAllTimezones(): { label: string; value: string }[] {
  try {
    const names = Intl.supportedValuesOf('timeZone');
    const list = names.map((tz) => {
      const offset = getTimezoneOffset(tz);
      return { label: `(${offset}) ${tz}`, value: tz };
    });
    list.sort((a, b) => {
      const oa = a.label.match(/\(([+-]\d{2}:\d{2})\)/)?.[1] || '+00:00';
      const ob = b.label.match(/\(([+-]\d{2}:\d{2})\)/)?.[1] || '+00:00';
      const na =
        (oa[0] === '-' ? -1 : 1) * (parseInt(oa.slice(1, 3)) * 60 + parseInt(oa.slice(4)));
      const nb =
        (ob[0] === '-' ? -1 : 1) * (parseInt(ob.slice(1, 3)) * 60 + parseInt(ob.slice(4)));
      if (na !== nb) return na - nb;
      return a.value.localeCompare(b.value);
    });
    return list;
  } catch {
    return [
      { label: '(-12:00) Etc/GMT+12', value: 'Etc/GMT+12' },
      { label: '(-10:00) Pacific/Honolulu', value: 'Pacific/Honolulu' },
      { label: '(-08:00) America/Los_Angeles', value: 'America/Los_Angeles' },
      { label: '(-07:00) America/Denver', value: 'America/Denver' },
      { label: '(-06:00) America/Chicago', value: 'America/Chicago' },
      { label: '(-05:00) America/New_York', value: 'America/New_York' },
      { label: '(-03:00) America/Sao_Paulo', value: 'America/Sao_Paulo' },
      { label: '(+00:00) Europe/London', value: 'Europe/London' },
      { label: '(+01:00) Europe/Paris', value: 'Europe/Paris' },
      { label: '(+02:00) Europe/Helsinki', value: 'Europe/Helsinki' },
      { label: '(+03:00) Europe/Moscow', value: 'Europe/Moscow' },
      { label: '(+04:00) Asia/Dubai', value: 'Asia/Dubai' },
      { label: '(+05:00) Asia/Karachi', value: 'Asia/Karachi' },
      { label: '(+05:30) Asia/Kolkata', value: 'Asia/Kolkata' },
      { label: '(+05:45) Asia/Kathmandu', value: 'Asia/Kathmandu' },
      { label: '(+06:00) Asia/Dhaka', value: 'Asia/Dhaka' },
      { label: '(+07:00) Asia/Bangkok', value: 'Asia/Bangkok' },
      { label: '(+08:00) Asia/Shanghai', value: 'Asia/Shanghai' },
      { label: '(+09:00) Asia/Tokyo', value: 'Asia/Tokyo' },
      { label: '(+10:00) Australia/Sydney', value: 'Australia/Sydney' },
      { label: '(+12:00) Pacific/Auckland', value: 'Pacific/Auckland' },
    ];
  }
}
