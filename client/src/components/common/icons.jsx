const Icon = ({ d, size = 16, fill, stroke = 'currentColor', sw = 1.5, vb = 24, children, className = '', ...rest }) => (
  <svg
    viewBox={`0 0 ${vb} ${vb}`}
    width={size}
    height={size}
    fill={fill || 'none'}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const I = {
  home:        (p) => <Icon {...p} d="M3 11l9-8 9 8M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />,
  inbox:       (p) => <Icon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" /></Icon>,
  folder:      (p) => <Icon {...p} d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  users:       (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>,
  settings:    (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></Icon>,
  search:      (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>,
  bell:        (p) => <Icon {...p} d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0" />,
  plus:        (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  check:       (p) => <Icon {...p} d="M20 6 9 17l-5-5" />,
  x:           (p) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />,
  chevDown:    (p) => <Icon {...p} d="m6 9 6 6 6-6" />,
  chevRight:   (p) => <Icon {...p} d="m9 18 6-6-6-6" />,
  chevLeft:    (p) => <Icon {...p} d="m15 18-6-6 6-6" />,
  more:        (p) => <Icon {...p}><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /></Icon>,
  drag:        (p) => <Icon {...p}><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" /></Icon>,
  filter:      (p) => <Icon {...p} d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z" />,
  sort:        (p) => <Icon {...p} d="M3 6h18M6 12h12M10 18h4" />,
  calendar:    (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>,
  clock:       (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>,
  flag:        (p) => <Icon {...p} d="M4 22V4l9 4 7-3v11l-7 3-9-4Z" />,
  tag:         (p) => <Icon {...p}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" /><path d="M7 7h.01" /></Icon>,
  alert:       (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></Icon>,
  lock:        (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>,
  eye:         (p) => <Icon {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Icon>,
  eyeOff:      (p) => <Icon {...p} d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />,
  trash:       (p) => <Icon {...p} d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />,
  edit:        (p) => <Icon {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />,
  send:        (p) => <Icon {...p} d="m22 2-7 20-4-9-9-4 20-7Z" />,
  link:        (p) => <Icon {...p} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
  trending:    (p) => <Icon {...p} d="m23 6-9.5 9.5-5-5L1 18M17 6h6v6" />,
  inProgress:  (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6a6 6 0 0 1 0 12V6Z" fill="currentColor" stroke="none" /></Icon>,
  done:        (p) => <Icon {...p}><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="m9 12 2 2 4-4" stroke="#0A0A0B" /></Icon>,
  circle:      (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /></Icon>,
  square:      (p) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="3" /></Icon>,
  zap:         (p) => <Icon {...p} d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  spark:       (p) => <Icon {...p} d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
  paperclip:   (p) => <Icon {...p} d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
  message:     (p) => <Icon {...p} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />,
  command:     (p) => <Icon {...p} d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3Z" />,
  logo:        (p) => <Icon {...p} vb={24}><path d="M4 6h16M4 12h12M4 18h8" stroke="#10B981" strokeWidth="2.5" /></Icon>,
  arrowRight:  (p) => <Icon {...p} d="M5 12h14M12 5l7 7-7 7" />,
  logout:      (p) => <Icon {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  user:        (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>,
  menu:        (p) => <Icon {...p} d="M3 12h18M3 6h18M3 18h18" />,
};

export default Icon;
