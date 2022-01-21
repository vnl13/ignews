import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/react');
jest.mock('next/router');
jest.mock('../../services/prismic.ts');

const post = {
  slug: 'fake-slug',
  title: 'Fake Title',
  content: '<p>Fake Excerpt...</p>',
  updatedAt: '17 de janeiro de 2021',
};

describe('PostPreview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    });

    render(<PostPreview post={post} />);
    expect(screen.getByText('Fake Title')).toBeInTheDocument();
    expect(screen.getByText('Fake Excerpt...')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('redirects user if subscription is found', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        user: {
          name: 'John Doe',
          email: 'johndoe@mail.com',
        },
        expires: 'fake-expires',
        activeSubscription: 'fake-subscription',
      },
      status: 'authenticated',
    } as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<PostPreview post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/fake-slug');
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ type: 'heading', text: 'Fake Title' }],
          content: [{ type: 'paragraph', text: 'Fake Excerpt...' }],
        },
        last_publication_date: '01-17-2021',
      }),
    } as any);

    const response = await getStaticProps({
      params: {
        slug: 'fake-slug',
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'fake-slug',
            title: 'Fake Title',
            content: '<p>Fake Excerpt...</p>',
            updatedAt: '17 de janeiro de 2021',
          },
        },
      })
    );
  });
});
