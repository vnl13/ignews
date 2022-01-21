import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { getSession } from 'next-auth/react';

import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/react');
jest.mock('../../services/prismic.ts');

const post = {
  slug: 'fake-slug',
  title: 'Fake Title',
  content: '<p>Fake Excerpt...</p>',
  updatedAt: '17 de janeiro de 2021',
};

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />);
    expect(screen.getByText('Fake Title')).toBeInTheDocument();
    expect(screen.getByText('Fake Excerpt...')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: {
        slug: 'fake-slug',
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        }),
      })
    );
  });

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ type: 'heading', text: 'Fake Title' }],
          content: [{ type: 'paragraph', text: 'Fake Excerpt...' }],
        },
        last_publication_date: '01-17-2021',
      }),
    } as any);

    const response = await getServerSideProps({
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
