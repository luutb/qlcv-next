import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SkeletonLoader,
  CaseCardSkeleton,
  TaskCardSkeleton,
  FormSkeleton,
  TableSkeleton,
  UserAvatarSkeleton,
  StatsCardSkeleton,
} from '../SkeletonLoader';

describe('SkeletonLoader Components', () => {
  describe('SkeletonLoader', () => {
    it('should render default skeleton', () => {
      render(<SkeletonLoader />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBe(1);
    });

    it('should render multiple skeletons when count is provided', () => {
      render(<SkeletonLoader count={3} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBe(3);
    });

    it('should support different variants', () => {
      const { container } = render(<SkeletonLoader variant="circular" />);

      const circularSkeleton = container.querySelector('.MuiCircularProgress-root');
      expect(circularSkeleton).toBeInTheDocument();
    });
  });

  describe('CaseCardSkeleton', () => {
    it('should render default number of case cards', () => {
      render(<CaseCardSkeleton />);
      const cards = screen.getAllByRole('progressbar');

      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render specified number of case cards', () => {
      render(<CaseCardSkeleton count={5} />);
      const cards = screen.getAllByRole('progressbar');

      expect(cards.length).toBeGreaterThan(4);
    });

    it('should have proper structure for case card', () => {
      const { container } = render(<CaseCardSkeleton count={1} />);

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });
  });

  describe('TaskCardSkeleton', () => {
    it('should render default number of task cards', () => {
      render(<TaskCardSkeleton />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render specified number of task cards', () => {
      render(<TaskCardSkeleton count={4} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(3);
    });
  });

  describe('FormSkeleton', () => {
    it('should render default number of form fields', () => {
      render(<FormSkeleton />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render specified number of form fields', () => {
      render(<FormSkeleton fieldCount={6} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(5);
    });
  });

  describe('TableSkeleton', () => {
    it('should render table with rows and columns', () => {
      render(<TableSkeleton rowCount={5} columnCount={4} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render header skeletons', () => {
      render(<TableSkeleton rowCount={3} columnCount={3} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('UserAvatarSkeleton', () => {
    it('should render user avatars with loading state', () => {
      render(<UserAvatarSkeleton count={3} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render specified number of user avatars', () => {
      render(<UserAvatarSkeleton count={5} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(4);
    });
  });

  describe('StatsCardSkeleton', () => {
    it('should render stats cards', () => {
      render(<StatsCardSkeleton />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render specified number of stats cards', () => {
      render(<StatsCardSkeleton count={6} />);
      const skeletons = screen.getAllByRole('progressbar');

      expect(skeletons.length).toBeGreaterThan(5);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes for loading states', () => {
      render(<SkeletonLoader aria-label="Loading content" />);
      const skeleton = screen.getByRole('progressbar');

      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should announce loading state to screen readers', () => {
      render(<SkeletonLoader />);
      const skeleton = screen.getByRole('progressbar');

      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
