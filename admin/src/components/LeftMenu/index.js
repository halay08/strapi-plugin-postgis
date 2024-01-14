/**
 *
 * LeftMenu
 *
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from '@strapi/design-system/SubNav';
import { TextButton } from '@strapi/design-system/TextButton';
import { useIntl } from 'react-intl';
import matchSorter from 'match-sorter';
import sortBy from 'lodash/sortBy';
import toLower from 'lodash/toLower';
import getTrad from '../../utils/getTrad';

const matchByTitle = (links, search) =>
  matchSorter(links, toLower(search), { keys: [item => toLower(item.title)] });

const LeftMenu = ({collectionTypeLinks = []}) => {
  const [search, setSearch] = useState('');
  const { formatMessage } = useIntl();

  const toIntl = links =>
    links.map(link => {
      return {
        ...link,
        title: formatMessage({ id: link.title, defaultMessage: link.title }),
      };
    });

  const intlCollectionTypeLinks = toIntl(collectionTypeLinks);

  const menu = [
    {
      id: 'collectionTypes',
      title: {
        id: getTrad('components.LeftMenu.collection-types'),
        defaultMessage:
          '{number, plural, =0 {Collection Types} one {Collection Type } other {Collection Types}}',
        values: { number: intlCollectionTypeLinks.length },
      },
      searchable: true,
      links: sortBy(matchByTitle(intlCollectionTypeLinks, search), object =>
        object.title.toLowerCase()
      ),
    }
  ];

  const handleClear = () => {
    setSearch('');
  };

  const handleChangeSearch = ({ target: { value } }) => {
    setSearch(value);
  };

  const label = formatMessage({
    id: getTrad('header.name'),
    defaultMessage: 'Content',
  });

  return (
    <SubNav ariaLabel={label}>
      <SubNavHeader
        label={label}
        searchable
        value={search}
        onChange={handleChangeSearch}
        onClear={handleClear}
        searchLabel={formatMessage({
          id: 'content-manager.components.LeftMenu.Search.label',
          defaultMessage: 'Search for a content type',
        })}
      />
      <SubNavSections>
        {menu.map(section => {
          const label = formatMessage(
            { id: section.title.id, defaultMessage: section.title.defaultMessage },
            section.title.values
          );

          return (
            <SubNavSection
              key={section.id}
              label={label}
              badgeLabel={section.links.length.toString()}
            >
              {section.links.map(link => {
                return (
                  <>
                  <SubNavLink key={link.uid} to={`${link.to}`}>
                    {link.title}
                  </SubNavLink>
                    
                </>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
    </SubNav>
  );
};

export default LeftMenu;