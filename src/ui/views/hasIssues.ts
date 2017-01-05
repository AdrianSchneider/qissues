import View from '../view';
import Issue from '../../domain/model/issue';
import IssuesCollection from '../../domain/model/issues';

interface HasIssues extends View {
  getIssue(): Issue;
  getIssues(): IssuesCollection;
}

export default HasIssues;
