import unittest
from official_path_gate import OfficialAction, resolve_github_from_affordance, AffordanceIgnored

class TestOfficialLinkBeforeGuess(unittest.TestCase):
    def setUp(self):
        self.actions = [
            OfficialAction(kind='button', label='View on GitHub', target='https://github.com/obra/superpowers'),
            OfficialAction(kind='link', label='View details', target='https://skillsllm.com/skill/superpowers'),
        ]

    def test_official_link_is_used_before_guessing_url(self):
        # BASELINE mutante: guess com botão presente deve falhar
        with self.assertRaises(AffordanceIgnored):
            resolve_github_from_affordance(
                self.actions,
                allow_guess=False,
                guessed_url='https://raw.githubusercontent.com/obra/superpowers/master/SKILL.md',
            )
        # CORRIGIDO: usa botão oficial e captura URL real
        res = resolve_github_from_affordance(
            self.actions,
            official_open_result={
                'ok': True,
                'url': 'https://github.com/obra/superpowers',
                'default_branch': 'main',
                'skill_path': 'skills/brainstorming/SKILL.md',
            },
        )
        self.assertTrue(res.used_official)
        self.assertFalse(res.guessed)
        self.assertEqual(res.url, 'https://github.com/obra/superpowers')
        self.assertEqual(res.skill_path, 'skills/brainstorming/SKILL.md')

    def test_mutant_without_gate_guesses_and_404_pattern(self):
        # MUTANTE: sem gate (allow_guess True e sem exigir oficial) volta a aceitar URL inventada
        res = resolve_github_from_affordance(
            self.actions,
            allow_guess=True,
            guessed_url='https://raw.githubusercontent.com/affaan-m/ecc/main/SKILL.md',
            official_open_result={'ok': False, 'error': 'simulated'},
        )
        self.assertTrue(res.guessed)
        self.assertTrue(res.failure_logged)
        self.assertIn('raw.githubusercontent.com', res.url)

    def test_graphify_default_branch_not_assumed_main(self):
        actions = [OfficialAction(kind='button', label='View on GitHub', target='https://github.com/Graphify-Labs/graphify')]
        res = resolve_github_from_affordance(
            actions,
            official_open_result={
                'ok': True,
                'url': 'https://github.com/Graphify-Labs/graphify',
                'default_branch': 'v8',
                'skill_path': 'graphify/skill.md',
            },
        )
        self.assertEqual(res.skill_path, 'graphify/skill.md')
        self.assertFalse(res.guessed)

if __name__ == '__main__':
    unittest.main()
