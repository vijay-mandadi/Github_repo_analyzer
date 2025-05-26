import React from 'react';
import RepoDetails from '../RepoDetails/RepoDetails';
import Contributors from '../Contributors/Contributors';
import Commits from '../Commits/Commits';
import LanguageChart from '../LanguageChart/LanguageChart';
import IssuesSnapshot from '../IssuesSnapshot/IssuesSnapshot';
import styles from './ResultsSection.module.css';

const ResultsSection = ({ repoDetails, contributors, commits, commitFrequency, commitFrequencyMonth, commitFrequencyYear, languageDistribution, issuesSnapshot }) => (
  <div className={styles.resultsSection}>
    <div className={styles.topRow}>
      <RepoDetails details={repoDetails} />
      <IssuesSnapshot data={issuesSnapshot} />
    </div>
    <LanguageChart data={languageDistribution} />
    <Contributors contributors={contributors} />
    <Commits commits={commits} commitFrequencyMonth={commitFrequencyMonth} commitFrequencyYear={commitFrequencyYear} />
  </div>
);

export default ResultsSection;
