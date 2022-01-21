import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';

import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic.ts');

const posts = [
  {
    slug: 'fake-slug',
    title: 'Fake Title',
    excerpt: 'Fake Excerpt...',
    updatedAt: '17 de janeiro de 2021',
  },
];

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />);
    expect(screen.getByText('Fake Title')).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'fake-slug',
            data: {
              title: [{ type: 'heading', text: 'Fake Title' }],
              content: [{ type: 'paragraph', text: 'Fake Excerpt...' }],
            },
            last_publication_date: '01-17-2021',
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'fake-slug',
              title: 'Fake Title',
              excerpt: 'Fake Excerpt...',
              updatedAt: '17 de janeiro de 2021',
            },
          ],
        },
      })
    );
  });
});
