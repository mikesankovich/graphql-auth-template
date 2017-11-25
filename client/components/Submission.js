import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import { hashHistory, Link } from 'react-router';

import ResponseForm from './ResponseForm';
import Response from './Response';
import currentUserQuery from '../queries/currentUser';

import fetchSubmission from '../queries/submission';

require("../css/styles.css")

class Submission extends Component {
  constructor(props) {
    super(props);
  }

  toSubmission(id) {
    hashHistory.push(id);
  }

  render() {
    const { data, submissionQuery, currentUserQuery } = this.props;
    const { loading } = data;
    let submission, currentUser;

    if (submissionQuery) {
      submission = submissionQuery.submission;
    }
    if (currentUserQuery) {
      currentUser = currentUserQuery.currentUser;
    }

    return (
      <div className="row">
        {!loading && submission && <div>
          <div className="col s12">
            <div className="col s10 submissionContent">
              <div className="submissionTitle">{submission.title}</div>
              <div className="submittedBy">Submitted by: <Link to="/">{submission.username}</Link></div>
              <p>{submission.content}</p>
            </div>
            <div className="col s10 m10 l6">
              <ResponseForm currentUser={currentUser} submissionId={submission.id} />
            </div>
          </div>
          <div className="col s10">
            {(submission.responses || []).map((response) => {
              return (
                <Response response={response} key={response.id} />
              )
            })}
          </div>
        </div>}
        {loading && <div></div>}
      </div>

    );
  }
}

export default compose(
  graphql(currentUserQuery, {
    name: 'currentUserQuery'
  }),
  graphql(fetchSubmission, {
    name: 'submissionQuery',
    options: (props) => {
      return {
        variables: {
          id: props.params.id
        }
      }
    }
  })
)(Submission)
