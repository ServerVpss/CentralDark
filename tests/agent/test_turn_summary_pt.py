"""PT-BR CLI presentation; protocol errors and tool tallies remain unchanged."""

from agent.turn_summary import TurnSummaryCollector, TurnTally, format_turn_summary


def test_pt_summary_preserves_counts_and_english():
    c = TurnSummaryCollector()
    for name in ("skill_view", "skill_view", "web_extract", "terminal", "web_search", "custom_tool"):
        c.record_tool(name)
    c.record_tool("terminal", is_error=True)
    assert c.render(200, language="pt") == (
        "⋯ 3m20s · leu 2 skills, 1 página · executou 1 comando · "
        "pesquisou na web 1 vez · chamou 1 ferramenta"
    )
    assert c.render(200) == (
        "⋯ 3m20s · read 2 skills, 1 page · ran 1 command · "
        "searched the web 1 time · called 1 tool"
    )


def test_pt_irregular_nouns_and_more():
    tally = TurnTally(verbs={"updated": {"memories": 1, "task lists": 2},
                             "searched the web": {"times": 2}})
    assert format_turn_summary(1, tally, language="pt") == (
        "⋯ 1.0s · atualizou 1 memória, 2 listas de tarefas · pesquisou na web 2 vezes"
    )
    assert format_turn_summary(1, tally, max_segments=1, language="pt").endswith("· +1 mais")


def test_pt_gateway_copy_preserves_protocol(monkeypatch):
    from agent.i18n import t
    from hermes_cli import cli_chat_error_copy as copy
    from hermes_cli.gateway_client import DISCONNECTED, NOT_SENT

    monkeypatch.setattr(copy, "t", lambda key, **kw: t(key, lang="pt", **kw))
    unknown = copy.chat_error_response(DISCONNECTED, failure_reason="gateway_connection")
    assert "resultado da execução é desconhecido" in unknown
    assert "Não reenvie o trabalho." in unknown
    assert copy.chat_error_response(NOT_SENT, failure_reason="gateway_connection").endswith("Nada foi enviado.")
    assert copy.chat_error_response("other refusal", failure_reason="gateway_connection") == "other refusal"
    assert DISCONNECTED.startswith("Gateway disconnected; turn outcome is unknown.")
