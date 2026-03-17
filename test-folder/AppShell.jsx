import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  Box, Stack, Typography, IconButton, Tooltip,
  Avatar, Divider, useTheme, alpha,
} from '@mui/material'
import {
  FolderOpen as FilesIcon,
  BarChart as RcaIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  NotificationsNone as BellIcon,
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
} from '@mui/icons-material'

const SIDEBAR_WIDTH = 220
const SIDEBAR_COLLAPSED = 56

const NAV_ITEMS = [
  { label: 'File processing', icon: <FilesIcon />, to: '/files' },
  { label: 'RCA analysis',    icon: <RcaIcon />,   to: '/rca' },
]

const BOTTOM_ITEMS = [
  { icon: <HelpIcon />,     label: 'Help',     to: '/help' },
  { icon: <SettingsIcon />, label: 'Settings', to: '/settings' },
]

export default function AppShell() {
  const theme = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Box
        component="nav"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .2s ease',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ height: 52, px: collapsed ? 1.5 : 2, gap: 1.5, flexShrink: 0 }}
        >
          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, flexShrink: 0, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RcaIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
          {!collapsed && (
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
              RCA Platform
            </Typography>
          )}
          <IconButton size="small" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <MenuIcon sx={{ fontSize: 18 }} /> : <CollapseIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, py: 0.75, overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_ITEMS.map((item) => <SidebarLink key={item.to} item={item} collapsed={collapsed} />)}
        </Box>

        <Divider />

        <Box sx={{ py: 0.75 }}>
          {BOTTOM_ITEMS.map((item) => <SidebarLink key={item.to} item={item} collapsed={collapsed} />)}
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            height: 52, bgcolor: 'background.paper',
            borderBottom: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', px: 2.5, flexShrink: 0, gap: 1,
          }}
        >
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Notifications">
            <IconButton size="small"><BellIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: 11, fontWeight: 600 }}>
              OP
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Ops User
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

function SidebarLink({ item, collapsed }) {
  const theme = useTheme()
  return (
    <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
      <NavLink to={item.to} style={{ textDecoration: 'none', display: 'block' }}>
        {({ isActive }) => (
          <Stack
            direction="row" alignItems="center" gap={1.5}
            sx={{
              mx: 0.75, my: 0.25, px: 1.25, py: 0.875,
              borderRadius: 1.5, cursor: 'pointer',
              color: isActive ? 'primary.main' : 'text.secondary',
              bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              fontWeight: isActive ? 500 : 400,
              overflow: 'hidden', whiteSpace: 'nowrap',
              transition: 'background .12s, color .12s',
              '&:hover': { bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'action.hover' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, '& svg': { fontSize: 18 } }}>
              {item.icon}
            </Box>
            {!collapsed && (
              <Typography variant="body2" fontWeight="inherit" color="inherit" noWrap>
                {item.label}
              </Typography>
            )}
          </Stack>
        )}
      </NavLink>
    </Tooltip>
  )
}
