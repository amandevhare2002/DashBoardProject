/**
 * src/containers/Container.jsx
 * Author: H.Alper Tuna <halpertuna@gmail.com>
 * Date: 16.09.2016
 */

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Container from '../components/Container';

// Memoized selector — only recomputes when content or itemId actually changes
const makeGetItems = () => createSelector(
  (store, ownProps) => store[ownProps.reduxStoreName].content[ownProps.reduxUid],
  (_, ownProps) => ownProps.itemId,
  (content, itemId) => content.filter(item => item.parentId === itemId)
);

const makeMapStateToProps = () => {
  const getItems = makeGetItems();
  return (store, ownProps) => ({
    items: getItems(store, ownProps),
  });
};

export default connect(makeMapStateToProps)(Container);