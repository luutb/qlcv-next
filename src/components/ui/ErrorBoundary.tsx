'use client';

import React, { Component, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to error reporting service (if configured)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    // Show toast notification
    toast.error('Đã xảy ra lỗi. Vui lòng thử lại.', {
      duration: 5000,
      position: 'top-right',
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <ErrorIcon
                  sx={{
                    fontSize: 64,
                    color: 'error.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h5" gutterBottom color="error.main">
                  Đã xảy ra lỗi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Xin lỗi, đã có lỗi xảy ra khi tải trang này.
                </Typography>
              </Box>

              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Chi tiết lỗi</AlertTitle>
                {this.state.error?.message || 'Lỗi không xác định'}
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                  }}
                >
                  Tải lại trang
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                >
                  Về trang chủ
                </Button>
              </Box>

              <Button
                onClick={this.toggleDetails}
                startIcon={this.state.showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ width: 'fit-content' }}
              >
                {this.state.showDetails ? 'Ẩn chi tiết' : 'Hiện chi tiết kỹ thuật'}
              </Button>

              <Collapse in={this.state.showDetails}>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: 200,
                  }}
                >
                  <Typography variant="caption" component="div" gutterBottom>
                    <strong>Error:</strong>
                  </Typography>
                  <Typography variant="caption" component="pre" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {this.state.error?.stack || 'No stack trace available'}
                  </Typography>
                  <Typography variant="caption" component="div" gutterBottom>
                    <strong>Component Stack:</strong>
                  </Typography>
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo?.componentStack || 'No component stack available'}
                  </Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AsyncErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function AsyncErrorBoundary({
  children,
  fallback,
}: AsyncErrorBoundaryProps) {
  const [state, setState] = React.useState<AsyncErrorBoundaryState>({
    hasError: false,
    error: null,
  });

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setState({
        hasError: true,
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      });
      toast.error('Đã xảy ra lỗi không mong muốn', {
        duration: 5000,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (state.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <AlertTitle>Lỗi không mong muốn</AlertTitle>
          <Typography variant="body2" gutterBottom>
            {state.error?.message || 'Đã xảy ra lỗi không xác định'}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Tải lại trang
          </Button>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;
